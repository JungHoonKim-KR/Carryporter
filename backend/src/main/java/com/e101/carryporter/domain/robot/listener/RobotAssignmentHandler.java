package com.e101.carryporter.domain.robot.listener;

import com.e101.carryporter.domain.mission.event.MissionCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@Slf4j
public class RobotAssignmentHandler {

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMissionCreatedEvent(MissionCreatedEvent event) {
        log.debug("robot assignment handler!! handler mission created event!!!");
    }
}
