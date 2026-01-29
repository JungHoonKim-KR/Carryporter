package com.e101.carryporter.domain.sse.listener;

import com.e101.carryporter.domain.mission.event.MissionStartedEvent;
import com.e101.carryporter.domain.robot.event.RobotAssignedEvent;
import com.e101.carryporter.domain.sse.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSseNotificationHandler {
    private final SseService sseService;

    /**
     * 관리자에게 매칭 완료 + 전재 알림 발송
     * RobotAssignedEvent
     * @param event 로봇 매칭 완료 시
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleRobotAssignedEvent(RobotAssignedEvent event){
        sseService.broadcastToAdmins("RobotAssignedEvent", "로봇이 배정 되었습니다. 박스를 적재해주세요.");
    }

    /**
     * 관리자 알림
     * MissionStartedEvent
     * @param event 관리자 이동 승인 호출 api 발생 시
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleMissionStartedEvent(MissionStartedEvent event){
        sseService.broadcastToAdmins("MissionStartedEvent", "로봇이 출발했습니다.");

    }

//    /** 이벤트가 없어서 모두 주석 해놨어용
//     * 로봇 관리소 도착
//     * RobotReturnedEvent
//     * @param event
//     */
//    @Async
//    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
//    public void handleRobotReturnedEvent(RobotReturnedEvent event){
//        sseService.broadcastToAdmins("RobotReturnedEvent", "로봇이 복귀했습니다.");
//    }
}
