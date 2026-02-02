package com.e101.carryporter.domain.mission.listener;

import com.e101.carryporter.domain.mission.service.MissionService;
import com.e101.carryporter.domain.robot.event.RobotArrivalEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class MissionStatusHandler {

    private final MissionService missionService;

    @Async
    @EventListener
    public void handleRobotArrivalEvent(RobotArrivalEvent event) {
        missionService.completeArrival(event.missionId());
    }

}
