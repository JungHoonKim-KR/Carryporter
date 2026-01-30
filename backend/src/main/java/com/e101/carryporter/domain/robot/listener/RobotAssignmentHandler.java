package com.e101.carryporter.domain.robot.listener;

import com.e101.carryporter.domain.mission.event.MissionCreatedEvent;
import com.e101.carryporter.domain.robot.service.RobotAssignService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@Slf4j
@RequiredArgsConstructor
public class RobotAssignmentHandler {

    private final RobotAssignService robotAssignService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMissionCreatedEvent(MissionCreatedEvent event) {
        robotAssignService.assignRobotToMission(event.missionId());
    }
}
