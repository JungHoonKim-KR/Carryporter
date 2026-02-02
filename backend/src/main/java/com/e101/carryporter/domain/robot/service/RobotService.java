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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * 로봇 등록 (MQTT register 토픽에서 호출)
     * 로봇 상태 cache 반영 (Redis 캐시 동기화)
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Robot registerRobot(String macAddress) {
        Robot robot;

        try {
            // 로봇 mac 주소로 조회 시도
            robot = robotRepository.findByMacAddress(macAddress)
                    .map(existingRobot -> {
                        log.info("이미 등록된 로봇 - MAC: {}, robotCode: {}", macAddress, existingRobot.getRobotCode());
                        return existingRobot;
                    })
                    .orElseGet(() -> {
                        // 2. 없으면 신규 생성
                        String robotCode = generateRobotCode();
                        Robot newRobot = Robot.createRobot(robotCode, macAddress);
                        robotRepository.save(newRobot);
                        log.info("새 로봇 등록 완료 - MAC: {}, robotCode: {}", macAddress, robotCode);
                        return newRobot;
                    });

        } catch (DataIntegrityViolationException e) {
            // 3. 동시 INSERT로 인한 중복 예외 → 재조회
            // 같은 mac 주소로 등록했기 때문에 무조건 존재
            log.warn("MAC 주소 중복 감지, 재조회: MAC={}", macAddress);
            em.clear();
            robot = robotRepository.findByMacAddress(macAddress)
                    .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND));
        }

        // Redis 캐시 동기화 (기존/신규 모두)
        // MAC 주소 매핑
        cacheService.saveMacMapping(macAddress, robot.getId());

        // 실시간 로봇 정보 (status, battery 등록)
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
    public Long assignRobotToMission(Long missionId) {
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
                    mission.getLocker().getLockerCode(),
                    "FIRST"
            ));

            log.info("미션 배차 완료: userId={}, missionId={}, robotId={}",
                    mission.getUser().getId(), missionId, availableRobotId);

            return availableRobotId;

        } catch (Exception e) {
            log.error("배차 실패 (롤백): missionId={}", missionId, e);

            // DB 실패 시 Redis 상태 복구 (BUSY → IDLE)
            if (availableRobotId != null) {
                log.warn("로봇 상태 복구: robotId={}", availableRobotId);
                cacheService.releaseRobot(availableRobotId);
            }

            throw e;
        }
    }

    public void lockByAdmin(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new BusinessException(MissionErrorCode.MISSION_NOT_FOUND));

        Robot robot = mission.getRobot();
        eventPublisher.publishEvent(new AdminLockRequestEvent(missionId, robot.getMacAddress()));
    }

    public void unlockByAdmin(Long missionId, Long robotId) {
        Robot robot = findById(robotId);
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
                10.0,
                20.0
        ));
    }

    /**
     * 관리자 최종 점검 완료 → 로봇 상태를 IDLE로 변경
     */
    @Transactional
    public void finalizeMission(Long missionId, Long robotId) {
        findById(robotId); // 로봇 존재 확인
        eventPublisher.publishEvent(new MissionFinalizedEvent(missionId, robotId));
    }
}
