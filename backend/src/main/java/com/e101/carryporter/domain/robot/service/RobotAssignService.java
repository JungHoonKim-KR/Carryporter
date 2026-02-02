package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.service.MissionService;
import com.e101.carryporter.domain.robot.event.RobotAssignedEvent;
import com.e101.carryporter.domain.robot.exception.RobotErrorCode;
import com.e101.carryporter.domain.robot.repository.RobotAvailableQueueRepository;
import com.e101.carryporter.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RobotAssignService {

    private final ApplicationEventPublisher eventPublisher;
    private final RobotAvailableQueueRepository queueRepository;
    private final MissionService missionService;

    public Long assignRobotToMission(Long missionId) {
        Long availableRobotId = null;

        try {
            // blocking
            availableRobotId = queueRepository.acquireRobotId()
                    .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_AVAILABLE));

            // db 에 mission, robot 상태 변경
            missionService.assignRobot(missionId, 1L);

            // mission 조회
            Mission findMission = missionService.findById(missionId);

            Long userId = findMission.getUser().getId();
            String robotCode = findMission.getRobot().getRobotCode();

            log.debug("[{}] 번 사용자 [{}] 번 미션에 [{}] 로봇 배정", userId, missionId, availableRobotId);

            eventPublisher.publishEvent(new RobotAssignedEvent(userId, robotCode));
            return availableRobotId;
        } catch (Exception e) {
            log.error("배차 중 error 발생!! missionId = {}", missionId, e);
            if (availableRobotId != null) {
                log.error("할당된 로봇 반납 robotId = {}", availableRobotId);
                queueRepository.returnRobotToQueue(availableRobotId);
            }

            throw e;
        }

    }
}
