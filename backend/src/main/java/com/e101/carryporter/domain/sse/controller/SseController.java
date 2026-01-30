package com.e101.carryporter.domain.sse.controller;
import com.e101.carryporter.domain.sse.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/sse")
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

    /**
     * [2. 알림 발송용] - 브라우저 탭 2번에서 호출하는 곳
     * 이 주소를 호출하면 서버가 내부적으로 sseService를 통해 1번 탭에 알림을 쏩니다.
     */
    @GetMapping("/send/{userId}")
    public String sendTest(
            @PathVariable Long userId,
            @RequestParam String status
    ) {
        // status: eventName이 됨 (예: ASSIGNED, ARRIVED 등)
        String message = "실시간 알림 테스트입니다. 상태: " + status;

        sseService.sendToUser(userId, status, message);

        return "ID [" + userId + "]에게 [" + status + "] 알림 발송 완료!";
    }
}