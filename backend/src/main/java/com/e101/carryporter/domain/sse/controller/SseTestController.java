package com.e101.carryporter.domain.sse.controller;

import com.e101.carryporter.domain.sse.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test/sse")
@RequiredArgsConstructor
public class SseTestController {

    private final SseService sseService;

    // 1. 로봇 배정 알림 테스트 (모달창 뜨는지 확인)
    // 호출 URL: http://localhost:8080/api/test/sse/assign?code=ROBOT-999
    @GetMapping("/assign")
    public String testAssignment(@RequestParam(defaultValue = "TEST-ROBOT-01") String code) {

        Map<String, Object> data = new HashMap<>();
        data.put("msg", "로봇 배정이 완료되었습니다."); // 프론트에서 감지하는 핵심 키워드
        data.put("robotCode", code);
        data.put("timestamp", LocalDateTime.now());

        // 이벤트 이름은 프론트엔드 로직에 따라 중요할 수도, 안 중요할 수도 있지만 맞춰줍니다.
        sseService.broadcastToAdmins("message", data);
        return "✅ [로봇 배정] 이벤트 전송 완료: " + code;
    }

    // 2. 미션 출발 알림 테스트 (토스트 메시지 뜨는지 확인)
    // 호출 URL: http://localhost:8080/api/test/sse/start?code=ROBOT-999
    @GetMapping("/start")
    public String testStart(@RequestParam(defaultValue = "TEST-ROBOT-01") String code) {

        Map<String, Object> data = new HashMap<>();
        data.put("msg", "로봇이 출발했습니다."); // 프론트 감지 키워드
        data.put("robotCode", code);
        data.put("timestamp", LocalDateTime.now());

        sseService.broadcastToAdmins("MissionStartedEvent", data);

        return "🚀 [미션 출발] 이벤트 전송 완료: " + code;
    }

    // 3. 🏁 [로봇 복귀] 알림 테스트 (최종 점검 모달 확인용)
    // URL: /test/sse/return?robotId=ROBOT-999
    @GetMapping("/return")
    public String testReturn(@RequestParam(defaultValue = "ROBOT-999") String robotId) {

        // 실제 handleRobotReturned 메서드와 동일한 데이터 구조 생성
        Map<String, Object> data = new HashMap<>();
        data.put("missionId", System.currentTimeMillis()); // 임의의 미션 ID 생성
        data.put("robotId", robotId); // 파라미터로 받은 로봇 ID
        data.put("message", "로봇이 관리소에 도착했습니다. 최종 점검을 진행해주세요."); // 프론트 감지 키워드 '도착' 포함

        // 이벤트명 "ROBOT_RETURNED"로 전송
        sseService.broadcastToAdmins("ROBOT_RETURNED", data);

        return "🏁 [로봇 복귀] 이벤트 전송 완료 - ID: " + robotId;
    }
}
