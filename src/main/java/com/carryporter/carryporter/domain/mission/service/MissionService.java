package com.carryporter.carryporter.domain.mission.service;

import com.carryporter.carryporter.domain.location.entity.Location;
import com.carryporter.carryporter.domain.location.service.LocationService;
import com.carryporter.carryporter.domain.mission.entity.Mission;
import com.carryporter.carryporter.domain.mission.event.MissionCreateEvent;
import com.carryporter.carryporter.domain.mission.repository.MissionRepository;
import com.carryporter.carryporter.domain.mission.service.dto.requrest.CreateMissionServiceRequestDto;
import com.carryporter.carryporter.domain.mission.service.dto.response.CreateMissionResponseDto;
import com.carryporter.carryporter.domain.user.entity.User;
import com.carryporter.carryporter.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository missionRepository;
    private final UserService userService;
    private final LocationService locationService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CreateMissionResponseDto createMission(CreateMissionServiceRequestDto requestDto) {

        // 1. dto 정보 기반 entity 로 변경
        User user = userService.findById(requestDto.getUserId());
        Location startLocation = locationService.findById(requestDto.getStartLocationId());
        Location endLocation = locationService.findById(requestDto.getEndLocationId());

        // 2. mission 생성
        Mission mission = Mission.createMission(user, startLocation, endLocation);

        // 3. mission id 반환
        Long missionId = missionRepository.save(mission);

        // 4. mission 생성 event 발행
        eventPublisher.publishEvent(new MissionCreateEvent(missionId));

        return CreateMissionResponseDto.builder()
                .missionId(missionId)
                .build();
    }

}
