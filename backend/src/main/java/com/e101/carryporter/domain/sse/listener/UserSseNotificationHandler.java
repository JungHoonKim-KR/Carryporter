package com.e101.carryporter.domain.sse.listener;

import com.e101.carryporter.domain.mission.event.MissionAbortedEvent;
import com.e101.carryporter.domain.mission.event.MissionLockedEvent;
import com.e101.carryporter.domain.mission.event.MissionStartedEvent;
import com.e101.carryporter.domain.mission.event.MissionUnlockedEvent;
import com.e101.carryporter.domain.robot.event.RobotArrivalEvent;
import com.e101.carryporter.domain.robot.event.RobotAssignedEvent;
import com.e101.carryporter.domain.sse.service.SseService;
import com.e101.carryporter.domain.user.event.UserAuthSuccessEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserSseNotificationHandler {

    private final SseService sseService;

    /**
     * 1. 로봇 배정 완료 (로봇 매칭 시)
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleRobotAssignedEvent(RobotAssignedEvent event) {
        sendNotification(event.userId(), event.getClass().getSimpleName(),
                "로봇 배정이 완료되었습니다.", event.robotCode());
    }

    /**
     * 2. 미션 시작 (로봇 출발 시)
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleMissionStartedEvent(MissionStartedEvent event) {
        sendNotification(event.userId(), event.getClass().getSimpleName(),
                "로봇이 출발했습니다.", event.robotCode());
    }

    /**
     * 3. 로봇 도착 (사용자 위치 도달 시)
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleRobotArrivalEvent(RobotArrivalEvent event) {
        sendNotification(event.userId(), event.getClass().getSimpleName(),
                "로봇이 도착했습니다. 수하물을 확인하고 잠금을 해제하세요.", event.robotCode());
    }

    /**
     * 4. 비밀번호 인증 요청 성공
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleUserAuthSuccessEvent(UserAuthSuccessEvent event) {
        sendNotification(event.userId(), event.getClass().getSimpleName(),
                "인증에 성공했습니다. 로봇을 여는 중입니다.", null);
    }

    public void handleMissionUnlockedEvent(MissionUnlockedEvent event){

    }



    /**
     * 5. 미션 중단 (인증 실패 횟수 초과 등)
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleMissionAbortedEvent(MissionAbortedEvent event) {
        sendNotification(event.userId(), event.getClass().getSimpleName(),
                "인증 실패 횟수를 초과하여 미션이 중단되었습니다.", null);
    }

    /**
     * 6. 미션 종료 및 잠금 (최종 완료)
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleMissionLockedEvent(MissionLockedEvent event) {
        sendNotification(event.userId(), event.getClass().getSimpleName(),
                "이용해 주셔서 감사합니다. 안녕히 가세요!", null);
    }

    /**
     * [공통] SSE 알림 전송 및 로그 출력 로직
     */
    private void sendNotification(Long userId, String eventName, String msg, String robotCode) {
        Map<String, Object> data = new HashMap<>();
        data.put("msg", msg);
        data.put("timestamp", LocalDateTime.now());

        if (robotCode != null) {
            data.put("robotCode", robotCode);
        }

        log.info("[SSE-USER] 전송 | 대상: {} | 이벤트: {} | 내용: {}", userId, eventName, msg);
        sseService.sendToUser(userId, eventName, data);
    }
}