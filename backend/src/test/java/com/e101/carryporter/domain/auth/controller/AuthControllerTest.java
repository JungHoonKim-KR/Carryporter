package com.e101.carryporter.domain.auth.controller;

import com.e101.carryporter.domain.auth.requestdto.AuthRequestDto;
import com.e101.carryporter.domain.auth.requestdto.VerifyCodeRequestDto;
import com.e101.carryporter.domain.auth.responsedto.AuthResponseDto;
import com.e101.carryporter.domain.auth.responsedto.TokenResponseDto;
import com.e101.carryporter.domain.auth.service.AuthService;
import com.e101.carryporter.global.utils.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtUtils jwtUtils;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("인증번호 요청 성공 테스트")
    void requestAuthTest() throws Exception {
        // given
        AuthRequestDto request = new AuthRequestDto("test@ssafy.com", 1234);

        // 가짜 응답 데이터
        AuthResponseDto mockResponse = new AuthResponseDto("SUCCESS", "인증번호 전송됨", 300L);

        // 서비스가 호출되면 가짜 응답을 리턴해라 (Mocking)
        given(authService.requestAuth(any(AuthRequestDto.class))).willReturn(mockResponse);

        // when & then
        mockMvc.perform(post("/api/auth/request")
                        .content(objectMapper.writeValueAsString(request))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("인증번호 전송됨"));
    }

    @Test
    @DisplayName("인증번호 검증 및 토큰 발급 성공 테스트")
    void verifyAuthTest() throws Exception {
        // given
        VerifyCodeRequestDto request = new VerifyCodeRequestDto("test@ssafy.com", 99);

        // 가짜 토큰 응답
        TokenResponseDto mockToken = TokenResponseDto.builder()
                .accessToken("fake-access-token")
                .tokenType("Bearer")
                .expiresIn(3600L)
                .build();

        // 서비스 Mocking
        given(authService.verifyAuth(any(VerifyCodeRequestDto.class))).willReturn(mockToken);

        // when & then
        mockMvc.perform(post("/api/auth/verify")
                        .content(objectMapper.writeValueAsString(request))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("fake-access-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }
}