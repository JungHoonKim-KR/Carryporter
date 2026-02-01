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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RobotService {

    private final LocationService locationService;
    private final RobotRepository robotRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final MissionRepository missionRepository;
    private final MissionService missionService;

    public Robot findById(Long robotId) {
        return robotRepository.findById(robotId)
                .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND));
    }

    public void lockByAdmin(Long missionId, Long robotId) {
        Robot robot = findById(robotId);
        eventPublisher.publishEvent(new AdminLockRequestEvent(missionId, robot.getMacAddress()));
    }

    public void unlockByAdmin(Long missionId, Long robotId) {
        Robot robot = findById(robotId);
        eventPublisher.publishEvent(new AdminUnlockRequestEvent(missionId, robot.getMacAddress()));
    }

    @Transactional
    public void move(DispatchServiceRequestDto requestDto) {
        //userid -> 해당 이벤트가 사용자에게도 가서 필요)와 robotcode 전달을 위해서 수정

        Mission mission = missionService.findById(requestDto.getMissionId());
        Robot robot = findById(requestDto.getRobotId());
        Location callLocation = locationService.findById(requestDto.getCallLocationId());

        missionService.dispatch(mission.getId(), robot.getId());

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
