package com.e101.carryporter.domain.mission.service;

import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.service.LocationService;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.event.MissionCreatedEvent;
import com.e101.carryporter.domain.mission.exception.MissionErrorCode;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.mission.service.dto.request.CreateMissionServiceRequestDto;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.exception.RobotErrorCode;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.service.UserService;
import com.e101.carryporter.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository missionRepository;
    private final UserService userService;
    private final LocationService locationService;
    private final RobotRepository robotRepository;
    private final ApplicationEventPublisher eventPublisher;

    public Mission findById(Long missionId) {
        return missionRepository.findById(missionId)
                .orElseThrow(() -> new BusinessException(MissionErrorCode.MISSION_NOT_FOUND));
    }

    @Transactional
    public Long createMission(Long userId, CreateMissionServiceRequestDto request) {

        // 사용자 와 호출 위치 조회
        User user = userService.findById(userId);
        Location location = locationService.findById(request.getCallLocationId());

        // 새 미션 생성
        Mission mission = Mission.createMission(user, location);
        Long createdMissionId = missionRepository.save(mission);

        // 새 미션 생성 완료 이벤트 발행
        eventPublisher.publishEvent(new MissionCreatedEvent(createdMissionId));

        return createdMissionId;
    }

    @Transactional
    public void assignRobot(Long missionId, Long robotId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new BusinessException(MissionErrorCode.MISSION_NOT_FOUND));

        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND));

        mission.assignRobot(robot);
    }
<<<<<<< HEAD

    @Transactional
    public void dispatch(Long missionId, Long robotId) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new BusinessException(MissionErrorCode.MISSION_NOT_FOUND));

        Robot robot = robotRepository.findById(robotId)
                .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND));

        mission.dispatch(robot);
    }

}
