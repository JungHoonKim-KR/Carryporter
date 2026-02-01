package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.service.MissionService;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.e101.carryporter.domain.robot.event.RobotAssignedEvent;
import com.e101.carryporter.domain.robot.exception.RobotErrorCode;
import com.e101.carryporter.domain.robot.repository.RobotAvailableQueueRepository;
import com.e101.carryporter.domain.robot.repository.RobotRealTimeRepository;
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
    private final RobotRealTimeRepository robotRealTimeRepository;
    private final MissionService missionService;

    public Long assignRobotToMission(Long missionId) {
        Long availableRobotId = null;

        try {
        // redis 가용 로봇 확보 (Atomic LPOP + BUSY 마킹)
        // 성공 시, Redis 상에서 이 로봇은 이미 BUSY 상태가 됨
        availableRobotId = queueRepository.acquireRobotId()
                .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_AVAILABLE));

        log.info("로봇 확보 성공 (Redis): robotId={}", availableRobotId);

        // db  미션 및 로봇 상태 업데이트 (Transaction)
        // 여기서 실패하면 catch 블록으로 이동하여 Redis 상태를 복구해야 함
        missionService.assignRobot(missionId, availableRobotId);

        //  배정 완료 이벤트 발행
        Mission findMission = missionService.findById(missionId);
        Long userId = findMission.getUser().getId();
        String robotCode = findMission.getRobot().getRobotCode();

        log.info("미션 배차 완료: userId={}, missionId={}, robotId={}", userId, missionId, availableRobotId);

        eventPublisher.publishEvent(new RobotAssignedEvent(userId, robotCode));

        return availableRobotId;

    } catch (Exception e) {
        log.error("배차 프로세스 중 에러 발생 (롤백 시도): missionId={}", missionId, e);

        // DB 저장 실패 시, 로봇을 다시 가용 상태로 복구
        if (availableRobotId != null) {
            log.warn("로봇 상태 복구 시도 (BUSY -> IDLE): robotId={}", availableRobotId);

            // IDLE로 상태를 바꾸면 -> Lua Script가 자동으로 대기열(List) 맨 뒤에 넣어줌
            robotRealTimeRepository.updateStatusOnly(availableRobotId, RobotStatus.IDLE);

            log.warn("로봇 상태 복구 완료");
        }

        throw e;
    }
}
}
