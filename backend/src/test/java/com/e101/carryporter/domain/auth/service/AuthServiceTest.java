package com.e101.carryporter.domain.auth.service;

import com.e101.carryporter.domain.auth.repository.TempPasswordRedisRepository;
import com.e101.carryporter.domain.auth.service.dto.request.AuthServiceReqeustDto;
import com.e101.carryporter.domain.auth.service.dto.request.VerifyCodeServiceRequestDto;
import com.e101.carryporter.domain.auth.repository.EmailCodeRedisRepository;
import com.e101.carryporter.domain.auth.controller.dto.response.AuthResponseDto;
import com.e101.carryporter.domain.auth.controller.dto.response.TokenResponseDto;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.support.IntegrationTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

class AuthServiceTest extends IntegrationTestSupport {

    @Autowired
    private AuthService authService;

    @Autowired
    private EmailCodeRedisRepository emailCodeRepository;

    @Autowired
    private TempPasswordRedisRepository tempPasswordRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("인증번호를 요청하면 실제 Redis에 데이터가 저장되어야 한다.")
    void requestAuthIntegrationTest() {
        // given
        String email = "test@ssafy.com";
        AuthServiceReqeustDto command = new AuthServiceReqeustDto(email, 1234);

        // when
        AuthResponseDto response = authService.requestAuth(command);

        // then
        assertThat(response.getStatus()).isEqualTo("SUCCESS");
        // 진짜 Redis에서 값을 꺼내어 확인
        assertThat(emailCodeRepository.get(email)).isPresent();
    }

    @Test
    @DisplayName("인증번호가 일치하면 유저가 DB에 저장되고 토큰이 발급된다.")
    void verifyAuthIntegrationTest() {
        // given
        String email = "verify@ssafy.com";
        Integer code = 99;
        Integer tempPassword = 1234; // 서비스 로직에서 요구하는 임시 비번

        // 1. 인증번호 저장
        emailCodeRepository.save(email, code);

        // 2. ✅ 아까 빠뜨린 부분: 임시 비밀번호도 Redis에 같이 있어야 함!
        tempPasswordRepository.save(email, tempPassword);

        VerifyCodeServiceRequestDto command = new VerifyCodeServiceRequestDto(email, code);

        // when
        TokenResponseDto response = authService.verifyAuth(command);

        // then
        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getRefreshToken()).isNotBlank();
        assertThat(userRepository.findByMmEmail(email)).isPresent();
    }
}