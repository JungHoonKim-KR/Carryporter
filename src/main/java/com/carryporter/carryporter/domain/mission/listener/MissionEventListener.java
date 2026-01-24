package com.carryporter.carryporter.domain.mission.listener;

import com.carryporter.carryporter.domain.mission.event.MissionCreateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@Slf4j
@RequiredArgsConstructor
public class MissionEventListener {

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMissionCreateEvent(MissionCreateEvent missionCreateEvent) {
        log.info("MissionCreateEvent received");
    }
}
