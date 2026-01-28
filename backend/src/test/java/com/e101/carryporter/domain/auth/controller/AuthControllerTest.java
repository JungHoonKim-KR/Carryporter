package com.e101.carryporter.domain.auth.controller;

import com.e101.carryporter.domain.auth.controller.dto.request.AuthRequestDto;
import com.e101.carryporter.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc // MockMvc 주입을 위해 필수!
class AuthControllerTest extends IntegrationTestSupport {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("올바른 이메일과 비밀번호로 요청 시 200 OK 응답을 받는다.")
    void requestAuthSuccess() throws Exception {
        // given
        AuthRequestDto requestDto = new AuthRequestDto("correct@ssafy.com", 1234);

        // when & then
        mockMvc.perform(post("/api/auth/request")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("잘못된 이메일 형식 요청 시 @Valid 검증에 의해 400 에러가 발생한다.")
    void requestAuthValidationError() throws Exception {
        // given
        AuthRequestDto requestDto = new AuthRequestDto("wrong-email-format", 1234);

        // when & then
        mockMvc.perform(post("/api/auth/request")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}