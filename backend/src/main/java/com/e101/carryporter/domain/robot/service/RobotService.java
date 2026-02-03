package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.admin.event.AdminLockRequestEvent;
import com.e101.carryporter.domain.admin.event.AdminUnlockRequestEvent;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.event.MissionFinalizedEvent;
import com.e101.carryporter.domain.mission.event.MissionStartedEvent;
import com.e101.carryporter.domain.mission.exception.MissionErrorCode;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.mission.service.MissionService;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.entity.RobotRealTimeInfo;
import com.e101.carryporter.domain.robot.event.RobotAssignedEvent;
import com.e101.carryporter.domain.robot.exception.RobotErrorCode;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.global.exception.BusinessException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.UUID;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RobotService {

    private final RobotRepository robotRepository;
    private final RobotCacheService cacheService;
    private final ApplicationEventPublisher eventPublisher;
    private final MissionService missionService;
    private final MissionRepository missionRepository;
    private final EntityManager em;
    private final TransactionTemplate transactionTemplate;

    /**
     * 로봇 등록 (MQTT register 토픽에서 호출)
     * 로봇 상태 cache 반영 (Redis 캐시 동기화)
     */
    @Transactional
    public Robot registerRobot(String macAddress) {
        Robot robot;

        try {
            robot = robotRepository.findByMacAddress(macAddress)
                    .orElseGet(() -> {
                                String robotCode = generateRobotCode();
                                Robot newRobot = Robot.createRobot(robotCode, macAddress);
                                robotRepository.save(newRobot);
                                em.flush();
                                log.info("새 로봇 등록 완료 - MAC: {}, robotCode: {}", macAddress, robotCode);
                                return newRobot;
                            }
                    );
        } catch (DataIntegrityViolationException e) {
            // 동시 INSERT로 인한 중복 → 새 트랜잭션에서 재조회
            log.warn("MAC 주소 중복 감지, 새 트랜잭션에서 재조회: MAC={}", macAddress);
            robot = robotRepository.findByMacAddress(macAddress)
                    .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND)
                    );
        }

        // Redis 캐시 동기화 (기존/신규 모두)
        cacheService.saveMacMapping(macAddress, robot.getId());

        RobotRealTimeInfo realTimeInfo = RobotRealTimeInfo.builder()
                .macAddress(macAddress)
                .status(robot.getRobotStatus())
                .battery(100)
                .build();

        cacheService.registerRobotStatus(robot.getId(), realTimeInfo);

        return robot;
    }

    private String generateRobotCode() {
        return "e101-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Robot findById(Long robotId) {
        return robotRepository.findById(robotId)
                .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND));
    }

    // ==================== 로봇 배차 ====================

    /**
     * 미션에 로봇 할당 (가용 로봇 획득 + DB 배정)
     */
    @Transactional
    public void assignRobotToMission(Long missionId) {
        Long availableRobotId = null;

        try {
            // 1. Redis에서 가용 로봇 획득 (원자적 LPOP + BUSY 마킹)
            availableRobotId = cacheService.acquireAvailableRobot()
                    .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_AVAILABLE));

            log.info("로봇 확보 성공: robotId={}", availableRobotId);

            // 2. DB 미션 배정
            missionService.assignRobot(missionId, availableRobotId);

            // 3. 배정 완료 이벤트 발행
            Mission mission = missionService.findById(missionId);
            eventPublisher.publishEvent(new RobotAssignedEvent(
                    mission.getUser().getId(),
                    mission.getId(),
                    mission.getRobot().getRobotCode(),
                    mission.getCallLocation().getLocationName(),
                    null,
                    "FIRST"
            ));

            log.info("미션 배차 완료: userId={}, missionId={}, robotId={}",
                    mission.getUser().getId(), missionId, availableRobotId);


        } catch (Exception e) {
            log.error("배차 실패 (롤백): missionId={}", missionId, e);

            // failed 로 mission 상태 update 실패 방어
            try {
                missionService.failMission(missionId);
            } catch (Exception ex) {
                log.error("미션 FAILED 상태로 업데이트 실패", ex);
            }

            // DB 실패 시 Redis 상태 복구 (BUSY → IDLE)
            if (availableRobotId != null) {
                log.warn("로봇 상태 복구: robotId={}", availableRobotId);
                cacheService.releaseRobot(availableRobotId);
            }

        }
    }

    public void lockByAdmin(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new BusinessException(MissionErrorCode.MISSION_NOT_FOUND));

        Robot robot = mission.getRobot();
        eventPublisher.publishEvent(new AdminLockRequestEvent(missionId, robot.getMacAddress()));
    }

    public void unlockByAdmin(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new EntityNotFoundException("Mission not found"));

        Robot robot = mission.getRobot();
        eventPublisher.publishEvent(new AdminUnlockRequestEvent(missionId, robot.getMacAddress()));
    }

    @Transactional
    public void dispatch(Long missionId) {
        //userid -> 해당 이벤트가 사용자에게도 가서 필요)와 robot code 전달을 위해서 수정
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new BusinessException(MissionErrorCode.MISSION_NOT_FOUND));

        missionService.dispatch(mission.getId());
        Robot robot = mission.getRobot();

        //로봇코드
        eventPublisher.publishEvent(new MissionStartedEvent(
                mission.getUser().getId(),
                mission.getId(),
                robot.getRobotCode(),
                robot.getMacAddress(),
                50.0,
                50.0
        ));
    }

    /**
     * 관리자 최종 점검 완료 → 로봇 상태를 IDLE로 변경
     */
    @Transactional
    public void finalizeMission(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new BusinessException(MissionErrorCode.MISSION_NOT_FOUND));
        Long robotId = mission.getRobot().getId();
        eventPublisher.publishEvent(new MissionFinalizedEvent(missionId, robotId));
    }
}
