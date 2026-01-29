package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.admin.event.AdminLockRequestEvent;
import com.e101.carryporter.domain.admin.event.AdminUnlockRequestEvent;
import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.service.LocationService;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.event.MissionStartedEvent;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
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

    public void move(DispatchServiceRequestDto requestDto) {
        //userid( -> 해당 이벤트가 사용자에게도 가서 필요)와 robotcode 전달을 위해서 수정
        Long missionId = requestDto.getMissionId();
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(()-> new EntityNotFoundException("미션을 찾을 수 없습니다."));
        Robot robot = robotRepository.findById(requestDto.getRobotId())
                .orElseThrow(()-> new EntityNotFoundException("로봇을 찾을 수 없습니다."));


        Location callLocation = locationService.findById(requestDto.getCallLocationId());


        //로봇코드
        eventPublisher.publishEvent(new MissionStartedEvent(
                mission.getUser().getId(),
                missionId,
                robot.getRobotCode(),
                robot.getMacAddress(),
                callLocation.getPositionX(),
                callLocation.getPositionY()
        ));
    }
}
