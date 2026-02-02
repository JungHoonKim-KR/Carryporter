package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.admin.event.AdminLockRequestEvent;
import com.e101.carryporter.domain.admin.event.AdminUnlockRequestEvent;
import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.service.LocationService;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.event.MissionFinalizedEvent;
import com.e101.carryporter.domain.mission.event.MissionStartedEvent;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.mission.service.MissionService;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.exception.RobotErrorCode;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.domain.robot.service.dto.request.DispatchServiceRequestDto;
import com.e101.carryporter.global.exception.BusinessException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RobotService {

    private final RobotRepository robotRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final MissionService missionService;
    private final MissionRepository missionRepository;

    /**
     * 로봇 등록 (MQTT register 토픽에서 호출)
     * 이미 등록된 MAC 주소면 기존 로봇 반환, 없으면 새로 생성
     */
    @Transactional
    public Robot registerRobot(String macAddress) {
        return robotRepository.findByMacAddress(macAddress)
                .map(existingRobot -> {
                    log.info("이미 등록된 로봇 - MAC: {}, robotCode: {}", macAddress, existingRobot.getRobotCode());
                    return existingRobot;
                })
                .orElseGet(() -> {
                    String robotCode = generateRobotCode();
                    Robot newRobot = Robot.createRobot(robotCode, macAddress);
                    robotRepository.save(newRobot);
                    log.info("새 로봇 등록 완료 - MAC: {}, robotCode: {}", macAddress, robotCode);
                    return newRobot;
                });
    }

    private String generateRobotCode() {
        return "e101-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Robot findById(Long robotId) {
        return robotRepository.findById(robotId)
                .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND));
    }

    public void lockByAdmin(Long missionId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new EntityNotFoundException("Mission not found"));

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
    public void move(Long missionId) {
        //userid -> 해당 이벤트가 사용자에게도 가서 필요)와 robotcode 전달을 위해서 수정

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new EntityNotFoundException("Mission not found"));

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
