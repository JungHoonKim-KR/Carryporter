package com.e101.carryporter.domain.sse.controller;
import com.e101.carryporter.domain.sse.dto.SseEventName;
import com.e101.carryporter.domain.sse.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;

    @GetMapping(value = "/subscribe", produces = "text/event-stream;charset=UTF-8")
    public SseEmitter subscribe(
            // [변경 전] @RequestAttribute String userId -> jwt 구현 전 필터가 주는 값 대신 해둠(임시!!!)
            // [변경 후] 테스트용으로 URL 파라미터로 받습니다.
            @RequestParam(value = "userId") Long userId,

            // role은 안 넣으면 기본값 "ROLE_USER"로 들어가게 설정
            @RequestParam(value = "role", defaultValue = "ROLE_USER") String role,
            HttpServletResponse response
    ) {
        // Nginx 버퍼링 방지
        response.addHeader("X-Accel-Buffering", "no");

        // 바로 서비스로 넘김
        return sseService.subscribe(userId, role);
    }

    // 테스트용: 내가 원하는 사람한테 알림 쏴보기
// 호출 URL: POST http://localhost:8080/api/sse/send?userId=user1&message=Hello
    @PostMapping("/send")
    public void sendTestMessage(@RequestParam Long userId, @RequestParam String message) {
        // SseEventName을 쓰거나, 테스트니까 그냥 문자열로 보냄
        sseService.sendToUser(userId, SseEventName.REQUEST_RECEIVED, message);
    }
}