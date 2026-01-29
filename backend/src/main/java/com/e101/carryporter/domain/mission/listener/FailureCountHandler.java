package com.e101.carryporter.domain.mission.listener;

import com.e101.carryporter.domain.auth.repository.LoginFailCountRedisRepository;
import com.e101.carryporter.domain.mission.event.MissionAbortedEvent;
import com.e101.carryporter.domain.user.event.UserAuthFailedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@Slf4j
@RequiredArgsConstructor
public class FailureCountHandler {

    private final LoginFailCountRedisRepository redisRepository; // Redis 담당자
    private final ApplicationEventPublisher eventPublisher;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void userAuthFailedHandle(UserAuthFailedEvent event){
        Long count = redisRepository.increment(event.userId());

        if(count >= 3){
            // 3회 넘으면 미션 중단 이벤트 발행
            eventPublisher.publishEvent(new MissionAbortedEvent(
                    event.missionId(),
                    event.userId(),
                    event.robotMacAddress(),
                    "비밀번호 입력 횟수 초과"
            ));
        }
    }
}
