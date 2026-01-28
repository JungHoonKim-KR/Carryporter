package com.e101.carryporter.domain.auth.service;

import com.e101.carryporter.domain.auth.repository.*;
import com.e101.carryporter.domain.auth.requestdto.AuthRequestDto;
import com.e101.carryporter.domain.auth.requestdto.VerifyCodeRequestDto;
import com.e101.carryporter.domain.auth.responsedto.AuthResponseDto;
import com.e101.carryporter.domain.auth.responsedto.TokenResponseDto;
import com.e101.carryporter.domain.user.entity.Role;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.global.utils.JwtUtils;
import com.e101.carryporter.global.utils.MattermostClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final MattermostClient mattermostClient;

    // [팀원 코드] Redis Repositories
    private final EmailCodeRedisRepository emailCodeRepository;
    private final TempPasswordRedisRepository tempPasswordRepository; // 님이나 팀원이 새로 추가
    private final UserPasswordRedisRepository userPasswordRepository;
    private final RefreshTokenRedisRepository refreshTokenRepository;
    private final LoginFailCountRedisRepository loginFailCountRepository;

    /**
     * 3-1. 인증번호 요청 (로봇 비번 임시 저장)
     */
    public AuthResponseDto requestAuth(AuthRequestDto requestDto) {
        String email = requestDto.getEmail();
        Integer password = requestDto.getPassword();

        // 1. 이미 가입된 이메일인지 체크 -> 이미 가입된 메일인데 다른 폰으로 접속한다면,,,? 어떡하징,,
        // 설명: 이메일로 찾았는데 데이터가 존재하면(.isPresent()) -> 이미 가입된 사람이므로 에러 발생
        if (userRepository.findByMmEmail(email).isPresent()) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        // 2. 인증번호 생성 (2자리)
        SecureRandom random = new SecureRandom();
        Integer authCode = random.nextInt(90) + 10;

        // 3. [Redis 저장]
        // A. 인증번호 저장 (팀원 코드: 5분 TTL)
        emailCodeRepository.save(email, authCode);

        // B. 임시 비밀번호 저장 (팀원 스타일로 추가한 Repo: 5분 TTL)
        tempPasswordRepository.save(email, password);

        // 4. Mattermost 발송
        mattermostClient.sendMessage(email, "CarryPorter 인증번호: [" + authCode + "]");

        // 5. [핵심] 팀원 코드에서 설정된 만료 시간을 조회해서 응답 (동기화)
        long expiresIn = emailCodeRepository.getExpireSeconds();

        return new AuthResponseDto("SUCCESS", "인증번호가 전송되었습니다.", expiresIn);
    }

    /**
     * 3-2. 인증 및 토큰 발급 (비밀번호 승격)
     */
    public TokenResponseDto verifyAuth(VerifyCodeRequestDto requestDto) {
        String email = requestDto.getEmail();
        Integer inputCode = requestDto.getCode();

        // 1. [보안] 인증번호 검증
        Integer redisCode = emailCodeRepository.get(email).orElse(null);;

        // 코드가 없거나 틀리면
        if (redisCode == null || !redisCode.equals(inputCode)) {
            // 아직 유저 ID가 없으므로 이메일 기반으로 로깅만 하거나,
            // 필요하다면 IP 기반 FailCount를 쓰기도 함 (여기선 간단히 예외처리)
            throw new IllegalArgumentException("AUTH_001:인증번호가 일치하지 않거나 만료되었습니다.");
        }

        // 2. [승격] 임시 비밀번호 꺼내오기
        Integer tempPassword = tempPasswordRepository.get(email)
                .orElseThrow(() -> new IllegalArgumentException("AUTH_002:인증 시간이 만료되었습니다."));


        // -------------------------------------------------------
        // [순서 변경] 3. 유저 생성/조회 (먼저 실행!)
        // -------------------------------------------------------
        User user = User.createUser(email);
        Long savedId = userRepository.save(user); // ★ 반환된 ID를 변수에 담습니다.
        // -------------------------------------------------------
        // [순서 변경] 4. 정식 비밀번호 저장 (이제 userId 사용 가능!)
        // -------------------------------------------------------
        // 팀원 코드: save(Long userId, String password) 호출 가능
        userPasswordRepository.save(savedId, tempPassword); // ★ 저장된 ID 사용

        // 5. 토큰 발급
        String accessToken = jwtUtils.createAccessToken(email, savedId); // ★ 저장된 ID 사용
        String refreshToken = jwtUtils.createRefreshToken(savedId); // ★ 저장된 ID 사용

        // 6. Refresh Token 저장 (팀원 코드: 7일 TTL)
        refreshTokenRepository.save(user.getId(), refreshToken);

        // 7. [정리] 사용한 임시 데이터 삭제
        emailCodeRepository.delete(email);
        tempPasswordRepository.delete(email);

        long expiresIn = jwtUtils.getAccessTokenValidityInSeconds();

        return TokenResponseDto.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn) // 여기에 3600이 자동으로 들어감
                .build();
    }

    /**
     * 3-3. 토큰 재발급
     */
    public TokenResponseDto reissue(String refreshToken) {
        // 1. Refresh Token 검증 (만료 여부 및 형식)
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new IllegalArgumentException("AUTH_003:유효하지 않은 Refresh Token입니다.");
        }

        // 2. Token에서 유저 ID 추출
        Long userId = jwtUtils.getUserIdFromToken(refreshToken);

        // 3. Redis에 저장된 토큰과 일치하는지 확인
        String savedToken = refreshTokenRepository.get(userId)
                .orElseThrow(() -> new IllegalArgumentException("AUTH_004:로그인 정보가 없거나 만료되었습니다."));

        if (!savedToken.equals(refreshToken)) {
            throw new IllegalArgumentException("AUTH_005:토큰 정보가 일치하지 않습니다.");
        }

        // 4. 새로운 유저 정보 조회 (이메일 등 필요)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("AUTH_006:존재하지 않는 유저입니다."));

        // 5. 새로운 Access Token 생성
        String newAccessToken = jwtUtils.createAccessToken(user.getMmEmail(), user.getId());
        long expiresIn = jwtUtils.getAccessTokenValidityInSeconds();

        return TokenResponseDto.builder()
                .accessToken(newAccessToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .build();
    }
}
