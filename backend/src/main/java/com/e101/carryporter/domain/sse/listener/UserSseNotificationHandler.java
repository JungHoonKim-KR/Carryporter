package com.e101.carryporter.domain.sse.listener;

import com.e101.carryporter.domain.mission.event.MissionAbortedEvent;
import com.e101.carryporter.domain.mission.event.MissionLockedEvent;
import com.e101.carryporter.domain.mission.event.MissionStartedEvent;
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

@Component
@RequiredArgsConstructor
@Slf4j
public class UserSseNotificationHandler {
    private final SseService sseService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleRobotAssignedEvent(RobotAssignedEvent event){
        log.info("[SSE] 로봇 배정 완료 -> 사용자 화면 전환필요 ");
//        sseService.sendToUser(); // 여기에 userId, event, data 넣어서 보내면 됩니당
    }

    /**
     * 관리자 알림
     * MissionStartedEvent
     * @param event 관리자 이동 승인 호출 api 발생 시
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleMissionStartedEvent(MissionStartedEvent event){
//        sseService.sendToUser(event.userId, "MissionStartedEvent", "로봇이 출발했습니다.");

    }

    /**
     * 로봇 도착 이벤트 듣기
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleRobotArrivalEvent(RobotArrivalEvent event){

        sseService.sendToUser(event.userId(), "ARRIVED", "로봇이 도착했습니다.");
    }

    /**
     * 비밀번호 인증 성공 이벤트 듣기
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleUserAuthSuccessEvent(UserAuthSuccessEvent event){
        sseService.sendToUser(event.userId(), "UNLOCKED", "인증 성공! 문이 열립니다.");
    }

    /**
     * 미션 중단 (실패 3회 등) 처리
     * - 상황: 비밀번호 3회 틀려서 로봇이 강제 복귀함
     * - 행동: 사용자 화면에 "실패했습니다" 띄우고 홈으로 보내야 함
     */
    @Async // 알림은 비동기로 빠르게 처리
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleMissionAborted(MissionAbortedEvent event) {
        // 프론트엔드에서 "ABORTED"라는 이벤트를 받으면 -> "인증 횟수 초과! 로봇이 복귀합니다." 라는 팝업을 띄우도록 약속
        sseService.sendToUser(
                event.userId(),
                "ABORTED",
                "인증 실패 횟수를 초과하여 미션이 중단되었습니다."
        );
    }

    /**
     * 미션 잠금 (최종 완료) 처리
     * - 상황: 사용자가 짐을 꺼내고/넣고 문을 잠금
     * - 행동: "이용해 주셔서 감사합니다" 보여주고 종료
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleMissionLockedEvent(MissionLockedEvent event) {
        // 프론트엔드에서 "LOCKED"라는 이벤트를 받으면 -> 연결을 끊어줘야 함
        sseService.sendToUser(
                event.userId(),
                "LOCKED", // 이 이벤트 이름이 중요합니다.
                "이용해 주셔서 감사합니다. 안녕히 가세요!"
        );
    }




}
