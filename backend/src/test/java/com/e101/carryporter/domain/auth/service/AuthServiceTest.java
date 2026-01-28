package com.e101.carryporter.domain.auth.service;

import com.e101.carryporter.domain.auth.dto.service.RequestAuthCommand;
import com.e101.carryporter.domain.auth.dto.service.VerifyAuthCommand;
import com.e101.carryporter.domain.auth.repository.EmailCodeRedisRepository;
import com.e101.carryporter.domain.auth.responsedto.AuthResponseDto;
import com.e101.carryporter.domain.auth.responsedto.TokenResponseDto;
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
    private UserRepository userRepository;

    @Test
    @DisplayName("인증번호를 요청하면 실제 Redis에 데이터가 저장되어야 한다.")
    void requestAuthIntegrationTest() {
        // given
        String email = "test@ssafy.com";
        RequestAuthCommand command = new RequestAuthCommand(email, 1234);

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
        // 테스트를 위해 미리 Redis에 데이터 세팅 (실제 레포지토리 사용)
        emailCodeRepository.save(email, code);
        // AuthService 로직상 필요한 임시비밀번호도 저장되어 있어야 함
        // (AuthService 수정본에서 TempPasswordRedisRepository도 주입받아 사용하세요)

        VerifyAuthCommand command = new VerifyAuthCommand(email, code);

        // when
        TokenResponseDto response = authService.verifyAuth(command);

        // then
        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getRefreshToken()).isNotBlank();

        // 실제 DB에 유저가 생성되었는지 확인 (@Transactional 롤백 확인 가능)
        assertThat(userRepository.findByMmEmail(email)).isPresent();
    }
}