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

    // =================================================================================
    // 🆕 1. [FIRST] 로봇 배정 알림 (보관 요청 -> 사물함 선택 필요)
    // URL: http://localhost:8080/api/test/sse/assign/first?robotCode=ROBOT-101
    // =================================================================================
    @GetMapping("/assign/first")
    public String testAssignFirst(@RequestParam(defaultValue = "ROBOT-101") String robotCode) {

        // RobotAssignedEvent (Record) 구조 모의
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("userId", 1004L);
        eventData.put("missionId", System.currentTimeMillis());
        eventData.put("robotCode", robotCode);
        eventData.put("callLocationName", "1층 로비");
        eventData.put("locker_code", null); // FIRST는 사물함이 아직 없음
        eventData.put("requestType", "FIRST");

        // 관리자에게 전송 (이벤트명: RobotAssignedEvent)
        sseService.broadcastToAdmins("RobotAssignedEvent", eventData);

        return "✅ [FIRST 배정] 이벤트 전송 완료 (사물함 선택 필요): " + robotCode;
    }

    // =================================================================================
    // 🆕 2. [RECALL] 로봇 배정 알림 (수령/반납 -> 사물함 이미 있음)
    // URL: http://localhost:8080/api/test/sse/assign/recall?robotCode=ROBOT-202
    // =================================================================================
    @GetMapping("/assign/recall")
    public String testAssignRecall(@RequestParam(defaultValue = "ROBOT-202") String robotCode) {

        // RobotAssignedEvent (Record) 구조 모의
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("userId", 8888L);
        eventData.put("missionId", System.currentTimeMillis());
        eventData.put("robotCode", robotCode);
        eventData.put("callLocationName", "3층 회의실");
        eventData.put("locker_code", "A-12"); // RECALL은 사물함이 이미 있음
        eventData.put("requestType", "RECALL");

        // 관리자에게 전송
        sseService.broadcastToAdmins("RobotAssignedEvent", eventData);

        return "🔄 [RECALL 배정] 이벤트 전송 완료 (사물함 A-12 확인): " + robotCode;
    }


    // =================================================================================
    // 👇 기존 테스트 코드들 (유지)
    // =================================================================================

    // 3. 미션 출발 알림 테스트
    @GetMapping("/start")
    public String testStart(@RequestParam(defaultValue = "TEST-ROBOT-01") String code) {
        Map<String, Object> data = new HashMap<>();
        data.put("msg", "로봇이 출발했습니다.");
        data.put("robotCode", code);
        data.put("timestamp", LocalDateTime.now());
        sseService.broadcastToAdmins("MissionStartedEvent", data);
        return "🚀 [미션 출발] 이벤트 전송 완료: " + code;
    }

    // 4. 로봇 복귀 알림 테스트
    @GetMapping("/return")
    public String testReturn(@RequestParam(defaultValue = "ROBOT-999") String robotId) {
        Map<String, Object> data = new HashMap<>();
        data.put("missionId", System.currentTimeMillis());
        data.put("robotId", robotId);
        data.put("message", "로봇이 관리소에 도착했습니다. 최종 점검을 진행해주세요.");
        sseService.broadcastToAdmins("ROBOT_RETURNED", data);
        return "🏁 [로봇 복귀] 이벤트 전송 완료 - ID: " + robotId;
    }
}