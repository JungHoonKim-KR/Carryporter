package com.e101.carryporter.domain.admin.listener;

import com.e101.carryporter.domain.robot.event.RobotReturnedEvent;
import com.e101.carryporter.domain.sse.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class AdminNotificationHandler {

    private final SseService sseService;

    /**
     * 로봇 관리소 도착 → 관리자에게 최종 점검 알림
     */
    @Async
    @EventListener
    public void handleRobotReturned(RobotReturnedEvent event) {
        log.info("[ADMIN SSE] 로봇 복귀 완료 - missionId: {}, robotId: {}, macAddress: {}",
                event.missionId(), event.robotId(), event.robotMacAddress());

        sseService.broadcastToAdmins(
                "ROBOT_RETURNED",
                Map.of(
                        "missionId", event.missionId(),
                        "robotId", event.robotId(),
                        "message", "로봇이 관리소에 도착했습니다. 최종 점검을 진행해주세요."
                )
        );
    }
}
