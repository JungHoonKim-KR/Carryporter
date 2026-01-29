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

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSseNotificationHandler {
    private final SseService sseService;


        /**
         * 1. 로봇 배정 완료 알림 (관리자 전체 공지)
         */
        @Async
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
        public void handleRobotAssignedEvent(RobotAssignedEvent event) {
            broadcast(event.getClass().getSimpleName(), "로봇 배정이 완료되었습니다.", event.robotCode());
        }

        /**
         * 2. 미션 시작 알림 (관리자 전체 공지)
         */
        @Async
        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
        public void handleMissionStartedEvent(MissionStartedEvent event) {
            broadcast(event.getClass().getSimpleName(), "로봇이 출발했습니다.", event.robotCode());
        }

        /** 이벤트가 없어서 모두 주석 해놨어용
         * 로봇 관리소 도착
         * RobotReturnedEvent
         * @param event
         */
//    @Async
//    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
//    public void handleRobotReturnedEvent(RobotReturnedEvent event){
//        Map<String, Object> data = new HashMap<>();
//        data.put("msg", "로봇이 복귀했습니다.");
//        data.put("robotCode", event.robotCode());
//        sseService.broadcastToAdmins("RobotReturnedEvent", data);
//    } 구현할 때 저한테 말씀해주시면 바로 구현 해드리겠습니당!!

        /**
         * [공통] 관리자 전체 브로드캐스트 전송 로직
         */
        private void broadcast(String eventName, String msg, String robotCode) {
            Map<String, Object> data = new HashMap<>();
            data.put("msg", msg);
            data.put("robotCode", robotCode);
            data.put("timestamp", java.time.LocalDateTime.now());

            log.info("[SSE-ADMIN] 브로드캐스트 | 이벤트: {} | 로봇: {} | 내용: {}", eventName, robotCode, msg);

            // 모든 관리자에게 알림 전송
            sseService.broadcastToAdmins(eventName, data);
        }
    }



