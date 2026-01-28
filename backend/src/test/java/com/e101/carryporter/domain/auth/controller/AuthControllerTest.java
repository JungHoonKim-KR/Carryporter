package com.e101.carryporter.domain.auth.controller;

import com.e101.carryporter.domain.auth.controller.dto.request.AuthRequestDto;
import com.e101.carryporter.domain.auth.controller.dto.response.AuthResponseDto;
import com.e101.carryporter.domain.auth.service.dto.request.AuthServiceReqeustDto;
import com.e101.carryporter.support.IntegrationTestSupport;
import com.e101.carryporter.support.WebMvcTestSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.BDDMockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest extends WebMvcTestSupport {

    @Test
    @DisplayName("올바른 이메일과 비밀번호로 요청 시 200 OK 응답을 받는다.")
    void requestAuthSuccess() throws Exception {
        // given
        AuthRequestDto requestDto = new AuthRequestDto("correct@ssafy.com", 1234);

        // stubbing (service 부터 mocking 해서 명시적으로 어떤 걸 반환할지 작성해줘야 합니다()
        given(authService.requestAuth(any(AuthServiceReqeustDto.class)))
                .willReturn(new AuthResponseDto("SUCCESS", "인증번호가 전송되었습니다.", 82, 123));

        // when & then

        mockMvc.perform(post("/auth/request")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(request -> {
                            request.setServletPath("/auth/request");
                            return request;
                        }))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("인증번호가 전송되었습니다."))
                .andExpect(jsonPath("$.code").value(82))
                .andExpect(jsonPath("$.expiresIn").value(123));

    }

    @Test
    @DisplayName("잘못된 이메일 형식 요청 시 @Valid 검증에 의해 400 에러가 발생한다.")
    void requestAuthValidationError() throws Exception {
        // given
        AuthRequestDto requestDto = new AuthRequestDto("wrong-email-format", 1234);

        // when & then
        mockMvc.perform(post("/auth/request")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(request -> {
                            request.setServletPath("/auth/request");
                            return request;
                        }))

                .andExpect(status().isBadRequest());
    }
}