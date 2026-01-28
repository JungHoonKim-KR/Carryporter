package com.e101.carryporter.domain.auth.service;

import com.e101.carryporter.domain.auth.service.dto.request.AuthServiceReqeustDto;
import com.e101.carryporter.domain.auth.service.dto.request.VerifyCodeServiceRequestDto;
import com.e101.carryporter.domain.auth.repository.*;
import com.e101.carryporter.domain.auth.controller.dto.response.AuthResponseDto;
import com.e101.carryporter.domain.auth.controller.dto.response.TokenResponseDto;
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

    private final EmailCodeRedisRepository emailCodeRepository;
    private final TempPasswordRedisRepository tempPasswordRepository;
    private final UserPasswordRedisRepository userPasswordRepository;
    private final RefreshTokenRedisRepository refreshTokenRepository;

    /**
     * 3-1. 인증번호 요청 (Command DTO 사용)
     */
    public AuthResponseDto requestAuth(AuthServiceReqeustDto command) {
        String email = command.email();
        Integer password = command.password();

        // 1. 인증번호 생성 (2자리)
        SecureRandom random = new SecureRandom();
        Integer authCode = random.nextInt(90) + 10;

        // 2. Redis 저장
        emailCodeRepository.save(email, authCode);
        tempPasswordRepository.save(email, password);

        // 3. Mattermost 발송
        mattermostClient.sendMessage(email, "CarryPorter 인증번호: [" + authCode + "]");

        long expiresIn = emailCodeRepository.getExpireSeconds();
        return new AuthResponseDto("SUCCESS", "인증번호가 전송되었습니다.", authCode, expiresIn);
    }

    /**
     * 3-2. 인증 및 토큰 발급 (Access + Refresh 동시 반환)
     */
    public TokenResponseDto verifyAuth(VerifyCodeServiceRequestDto command) {
        String email = command.email();
        Integer inputCode = command.code();

        // 1. 인증번호 검증
        Integer redisCode = emailCodeRepository.get(email)
                .orElseThrow(() -> new IllegalArgumentException("AUTH_001:인증번호가 만료되었습니다."));

        if (!redisCode.equals(inputCode)) {
            throw new IllegalArgumentException("AUTH_001:인증번호가 일치하지 않습니다.");
        }

        // 2. 임시 비밀번호 승격 준비
        Integer tempPassword = tempPasswordRepository.get(email)
                .orElseThrow(() -> new IllegalArgumentException("AUTH_002:인증 시간이 만료되었습니다."));

        // 3. 유저 생성 및 정식 비밀번호 저장
        User user = User.createUser(email);
        Long savedId = userRepository.save(user);
        userPasswordRepository.save(savedId, tempPassword);

        // 4. 토큰 발급 (Access & Refresh 둘 다 생성)
        String accessToken = jwtUtils.createAccessToken(email, savedId);
        String refreshToken = jwtUtils.createRefreshToken(savedId);

        // 5. Refresh Token Redis 저장
        refreshTokenRepository.save(savedId, refreshToken);

        // 6. 사용 완료 데이터 삭제
        emailCodeRepository.delete(email);
        tempPasswordRepository.delete(email);

        return TokenResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken) // 추가됨
                .tokenType("Bearer")
                .expiresIn(jwtUtils.getAccessTokenValidityInSeconds())
                .build();
    }

    /**
     * 3-3. 토큰 재발급
     */
    public TokenResponseDto reissue(String refreshToken) {
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new IllegalArgumentException("AUTH_003:유효하지 않은 Refresh Token입니다.");
        }

        Long userId = jwtUtils.getUserIdFromToken(refreshToken);
        String savedToken = refreshTokenRepository.get(userId)
                .orElseThrow(() -> new IllegalArgumentException("AUTH_004:로그인 정보가 없거나 만료되었습니다."));

        if (!savedToken.equals(refreshToken)) {
            throw new IllegalArgumentException("AUTH_005:토큰 정보가 일치하지 않습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("AUTH_006:존재하지 않는 유저입니다."));

        String newAccessToken = jwtUtils.createAccessToken(user.getMmEmail(), user.getId());

        return TokenResponseDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // 기존 리프레시 토큰 유지
                .tokenType("Bearer")
                .expiresIn(jwtUtils.getAccessTokenValidityInSeconds())
                .build();
    }
}