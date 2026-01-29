package com.e101.carryporter.domain.robot.listener;

import com.e101.carryporter.domain.mission.event.MissionFinalizedEvent;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.e101.carryporter.domain.robot.exception.RobotErrorCode;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@RequiredArgsConstructor
public class RobotStatusHandler {

    private final RobotRepository robotRepository;

    /**
     * 관리자 점검 완료 → 로봇 상태를 IDLE로 변경 (배정 가능)
     */
    @Async
    @EventListener
    @Transactional
    public void handleMissionFinalized(MissionFinalizedEvent event) {
        log.info("[ROBOT STATUS] 미션 최종 완료 - missionId: {}, robotId: {}",
                event.missionId(), event.robotId());

        Robot robot = robotRepository.findById(event.robotId())
                .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND));

        robot.changeStatus(RobotStatus.IDLE);

        log.info("[ROBOT STATUS] 로봇 상태 변경 완료 - robotId: {}, newStatus: IDLE", event.robotId());
    }
}
