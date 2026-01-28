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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) // Mockito 프레임워크 사용
class AuthServiceTest {

    @InjectMocks // 가짜 재료들을 주입받을 '진짜' 서비스 객체
    private AuthService authService;

    // ▼ 서비스가 필요로 하는 모든 재료들을 가짜(Mock)로 만듭니다.
    @Mock private UserRepository userRepository;
    @Mock private JwtUtils jwtUtils;
    @Mock private MattermostClient mattermostClient;
    @Mock private EmailCodeRedisRepository emailCodeRepository;
    @Mock private TempPasswordRedisRepository tempPasswordRepository;
    @Mock private UserPasswordRedisRepository userPasswordRepository;
    @Mock private RefreshTokenRedisRepository refreshTokenRepository;
    @Mock private LoginFailCountRedisRepository loginFailCountRepository;

    @Test
    @DisplayName("인증번호 요청 시: 이미 가입된 이메일이면 에러가 터져야 한다")
    void requestAuth_Fail_DuplicateEmail() {
        // given
        AuthRequestDto request = new AuthRequestDto("exist@ssafy.com", 1234);
        User existUser = User.builder().mmEmail("exist@ssafy.com").build();

        // 이미 유저가 있다고 가정
        given(userRepository.findByMmEmail("exist@ssafy.com")).willReturn(Optional.of(existUser));

        // when & then
        assertThatThrownBy(() -> authService.requestAuth(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("이미 가입된 이메일");
    }

    @Test
    @DisplayName("인증번호 요청 성공: Redis에 저장하고 메터를 보낸다")
    void requestAuth_Success() {
        // given
        String email = "new@ssafy.com";
        AuthRequestDto request = new AuthRequestDto(email, 1234);

        // 유저가 없다고 가정 (신규 가입)
        given(userRepository.findByMmEmail(email)).willReturn(Optional.empty());
        // Redis 만료시간 리턴값 설정
        given(emailCodeRepository.getExpireSeconds()).willReturn(300L);

        // when
        AuthResponseDto response = authService.requestAuth(request);

        // then
        assertThat(response.getStatus()).isEqualTo("SUCCESS");

        // 검증: Redis에 코드가 저장되었는가? (save 메서드가 호출되었는지 확인)
        verify(emailCodeRepository, times(1)).save(eq(email), anyInt());
        // 검증: 임시 비밀번호가 저장되었는가?
        verify(tempPasswordRepository, times(1)).save(eq(email), eq(1234));
        // 검증: 매터모스트 메시지를 보냈는가?
        verify(mattermostClient, times(1)).sendMessage(eq(email), anyString());
    }

    @Test
    @DisplayName("인증 확인 성공: 유저를 저장하고 토큰을 발급한다")
    void verifyAuth_Success() {
        // 1. [준비] 필요한 데이터 설정
        String email = "test@ssafy.com";
        Integer correctCode = 9999;
        Integer tempPw = 1234;
        Long userId = 100L; // 우리가 가짜로 정한 유저 ID

        VerifyCodeRequestDto request = new VerifyCodeRequestDto(email, correctCode);

        // 2. [약속/Stubbing] 가짜 객체들이 어떻게 행동할지 정의

        // Redis에서 코드와 비번 꺼내오기
        given(emailCodeRepository.get(email)).willReturn(Optional.of(correctCode));
        given(tempPasswordRepository.get(email)).willReturn(Optional.of(tempPw));

        // [핵심!] userRepository.save(user)가 실행될 때의 행동
        // 서비스 로직에서 save가 호출되면, 우리가 만든 가짜 ID(100L)를 리턴하라고 약속합니다.
        given(userRepository.save(any(User.class))).willReturn(userId);

        // [핵심!] jwtUtils가 호출될 때의 행동
        // ID가 100L인 유저에 대해 토큰을 생성해달라고 하면, 가짜 토큰을 주겠다고 약속합니다.
        // 인자 mismatch 에러를 피하기 위해 anyLong()을 사용합니다.
        given(jwtUtils.createAccessToken(eq(email), anyLong())).willReturn("access-token");
        given(jwtUtils.createRefreshToken(anyLong())).willReturn("refresh-token");
        given(jwtUtils.getAccessTokenValidityInSeconds()).willReturn(3600L);

        // 3. [실행] 테스트할 메서드 호출
        TokenResponseDto response = authService.verifyAuth(request);

        // 4. [검증] 결과가 맞는지 확인
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getExpiresIn()).isEqualTo(3600L);

        // [추가 검증] 서비스 내부에서 실제로 이 메서드들이 호출되었는지 확인
        verify(userRepository, times(1)).save(any(User.class)); // 유저 저장됐나?
        verify(userPasswordRepository).save(anyLong(), eq(tempPw)); // 비번 승격됐나?
        verify(emailCodeRepository).delete(email); // 인증번호 지웠나?
    }

    @Test
    @DisplayName("토큰 재발급 성공: 유효한 Refresh Token으로 새 Access Token을 받는다")
    void reissue_Success() {
        // given
        Long userId = 100L;
        String email = "test@ssafy.com";
        String oldRefreshToken = "valid-refresh-token";
        String newAccessToken = "new-access-token";

        // 가짜 객체들의 행동 약속
        given(jwtUtils.validateToken(oldRefreshToken)).willReturn(true);
        given(jwtUtils.getUserIdFromToken(oldRefreshToken)).willReturn(userId);

        // Redis에 토큰이 저장되어 있다고 가정
        given(refreshTokenRepository.get(userId)).willReturn(Optional.of(oldRefreshToken));

        // DB에서 유저 조회 성공 가정
        User user = User.createUser(email);
        ReflectionTestUtils.setField(user, "id", userId);
        given(userRepository.findById(userId)).willReturn(Optional.of(user));

        // 새로운 토큰 생성 약속
        given(jwtUtils.createAccessToken(email, userId)).willReturn(newAccessToken);
        given(jwtUtils.getAccessTokenValidityInSeconds()).willReturn(3600L);

        // when
        TokenResponseDto response = authService.reissue(oldRefreshToken);

        // then
        assertThat(response.getAccessToken()).isEqualTo(newAccessToken);
        verify(jwtUtils, times(1)).createAccessToken(anyString(), anyLong());
    }

    @Test
    @DisplayName("토큰 재발급 실패: Redis에 저장된 토큰과 다르면 에러가 난다")
    void reissue_Fail_TokenMismatch() {
        // given
        Long userId = 100L;
        String clientToken = "wrong-token";
        String serverToken = "stored-token";

        given(jwtUtils.validateToken(clientToken)).willReturn(true);
        given(jwtUtils.getUserIdFromToken(clientToken)).willReturn(userId);
        given(refreshTokenRepository.get(userId)).willReturn(Optional.of(serverToken));

        // when & then
        assertThatThrownBy(() -> authService.reissue(clientToken))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("AUTH_005");
    }
}
