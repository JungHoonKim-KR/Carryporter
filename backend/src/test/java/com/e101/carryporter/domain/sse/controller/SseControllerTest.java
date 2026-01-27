package com.e101.carryporter.domain.sse.controller;

import com.e101.carryporter.domain.sse.service.SseService;
import com.e101.carryporter.global.utils.JwtUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean; // Boot 3.4+
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SseController.class)
@AutoConfigureMockMvc(addFilters = false)
class SseControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    private JwtUtils jwtUtils;

    @MockitoBean
    SseService sseService;

    @DisplayName("SSE 구독 성공 테스트 (Role 포함)")
    @Test
    void subscribe() throws Exception {
        // given: 파라미터 2개를 받는 subscribe 메서드 Mocking
        given(sseService.subscribe(anyLong(), anyString()))
                .willReturn(new SseEmitter());

        // when & then
        mockMvc.perform(get("/api/sse/subscribe")
                        .param("userId", "1")
                        .param("role", "ROLE_USER") // ★ Role 파라미터 필수!
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andDo(print())
                .andExpect(status().isOk())
                // 비동기 시작 확인 (Content-Type null 에러 방지)
                .andExpect(request().asyncStarted());
    }
}