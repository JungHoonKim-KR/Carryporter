package com.e101.carryporter.domain.sse.listener;

import com.e101.carryporter.domain.mission.event.MissionStartedEvent;
import com.e101.carryporter.domain.robot.event.RobotAssignedEvent;
import com.e101.carryporter.domain.robot.event.RobotReturnedAdminEvent;
import com.e101.carryporter.domain.robot.event.RobotReturnedEvent;
import com.e101.carryporter.domain.sse.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSseNotificationHandler {
    private final SseService sseService;

    /**
     * 1. 사용자 호출 후 로봇 배정 완료 알림
     */
    @EventListener
    public void handleRobotAssignedEvent(RobotAssignedEvent event){
        sseService.broadcastToAdmins("RobotAssignedEvent", event);
    }
    /**
     * 2. 로봇 복귀 알림 -> 관리자 판단 후에 최종적으로 반납 or 보관 선택
     */
    @EventListener
    public void handleRobotReturnedAdminEvent(RobotReturnedAdminEvent event){
        sseService.broadcastToAdmins("RobotReturnedAdminEvent", event);
    }
    }



