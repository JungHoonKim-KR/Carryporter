package com.e101.carryporter.global.utils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class JwtUtilsTest {

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    @DisplayName("JWT 토큰 생성 및 검증 테스트")
    void tokenTest() {
        // given (준비)
        String email = "test@ssafy.com";
        Long userId = 1L;

        // when (실행: 토큰 만들기)
        String token = jwtUtils.createAccessToken(email, userId);
        System.out.println("생성된 토큰: " + token);

        // then (검증)
        // 1. 토큰이 null이 아니어야 함
        assertThat(token).isNotNull();

        // 2. 토큰이 유효하다고 판단되어야 함 (validateToken)
        boolean isValid = jwtUtils.validateToken(token);
        assertThat(isValid).isTrue();

        // 3. 토큰에서 꺼낸 이메일이 원래 이메일과 같아야 함
        String extractedEmail = jwtUtils.getMmEmailFromToken(token);
        assertThat(extractedEmail).isEqualTo(email);

        // 4. 토큰에서 꺼낸 userId가 원래 userId와 같아야 함
        Long extractedUserId = jwtUtils.getUserIdFromToken(token);
        assertThat(extractedUserId).isEqualTo(userId);
    }
}