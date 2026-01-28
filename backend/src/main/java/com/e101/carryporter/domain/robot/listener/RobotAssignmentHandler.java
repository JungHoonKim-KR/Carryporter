package com.e101.carryporter.domain.robot.listener;

import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.event.MissionCreatedEvent;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.e101.carryporter.domain.robot.event.RobotAssignedEvent;
import com.e101.carryporter.domain.robot.repository.RobotAvailableQueueRepository;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Optional;

@Component
@Slf4j
@RequiredArgsConstructor
public class RobotAssignmentHandler {

    private final RobotAvailableQueueRepository robotAvailableQueueRepository;
    private final MissionRepository missionRepository;
    private final RobotRepository robotRepository;
    private final TransactionTemplate transactionTemplate;
    private final ApplicationEventPublisher eventPublisher;
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMissionCreatedEvent(MissionCreatedEvent event) {
        log.info("미션 생성 이벤트 수신: missionId={}", event.missionId());

        try {
            // 가용 로봇 할당 대기 (blocking)
            log.info("가용 로봇 대기 중... missionId={}", event.missionId());
            Optional<Long> robotIdOpt = robotAvailableQueueRepository.acquireRobotId();

            if (robotIdOpt.isEmpty()) {
                log.warn("로봇 할당 타임아웃: missionId={}", event.missionId());
                // TODO: 타임아웃 시 처리 로직 (재시도, 알림 등)
                return;
            }

            Long robotId = robotIdOpt.get();
            log.info("로봇 할당 받음: missionId={}, robotId={}", event.missionId(), robotId);

            // 트랜잭션 내에서 Mission에 Robot 할당
            transactionTemplate.execute(status -> {
                // Mission 조회
                Mission mission = missionRepository.findById(event.missionId())
                        .orElseThrow(() -> new IllegalArgumentException("미션을 찾을 수 없습니다: " + event.missionId()));

                // Robot 조회
                Robot robot = robotRepository.findById(robotId)
                        .orElseThrow(() -> new IllegalArgumentException("로봇을 찾을 수 없습니다: " + robotId));

                // 로봇 할당
                mission.assignRobot(robot);
                robot.updateStatus(RobotStatus.RESERVED);

                eventPublisher.publishEvent(new RobotAssignedEvent(mission.getId(),  robotId, mission.getUser().getId()));
                return null;
            });

            log.info("로봇 할당 완료: missionId={}, robotId={}", event.missionId(), robotId);

        } catch (Exception e) {
            log.error("로봇 할당 처리 중 오류 발생: missionId={}", event.missionId(), e);
            throw e;
        }
    }
}
