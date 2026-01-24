package com.carryporter.carryporter.domain.mission.service;

import com.carryporter.carryporter.domain.location.entity.Location;
import com.carryporter.carryporter.domain.location.repository.LocationRepository;
import com.carryporter.carryporter.domain.mission.entity.Mission;
import com.carryporter.carryporter.domain.mission.event.MissionCreateEvent;
import com.carryporter.carryporter.domain.mission.repository.MissionRepository;
import com.carryporter.carryporter.domain.mission.service.dto.requrest.CreateMissionServiceRequestDto;
import com.carryporter.carryporter.domain.user.entity.User;
import com.carryporter.carryporter.domain.user.repository.UserRepository;
import com.carryporter.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

class MissionServiceTest extends IntegrationTestSupport {

    @Autowired
    MissionService missionService;

    @Autowired
    MissionRepository missionRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LocationRepository locationRepository;

    @Autowired
    EntityManager em;

    @DisplayName("새로운 미션을 생성할 수 있다")
    @Test
    void createMission() {
        // given
        User user = User.createBasicUser("test@mm.com");

        Location startLocation = Location.builder()
                .locationName("start")
                .description("desc 1")
                .build();

        Location endLocation = Location.builder()
                .locationName("end")
                .description("desc 1")
                .build();

        userRepository.save(user);
        locationRepository.save(startLocation);
        locationRepository.save(endLocation);

        flushAndClear();

        // when
        CreateMissionServiceRequestDto requestDto = CreateMissionServiceRequestDto.builder()
                .userId(user.getId())
                .startLocationId(startLocation.getId())
                .endLocationId(endLocation.getId())
                .build();

        Long missionId = missionService.createMission(requestDto).getMissionId();

        flushAndClear();

        Mission findMission = missionRepository.findById(missionId)
                .orElseThrow(EntityNotFoundException::new);

        // then
        assertThat(findMission.getUser().getMmEmail()).isEqualTo(user.getMmEmail());
        assertThat(findMission.getUser().getRole()).isEqualTo(user.getRole());
        assertThat(findMission.getStartLocation().getLocationName()).isEqualTo(startLocation.getLocationName());
        assertThat(findMission.getEndLocation().getLocationName()).isEqualTo(endLocation.getLocationName());
    }

    @DisplayName("새로운 미션을 생성하면 MissionCreateEvent가 발행된다")
    @Test
    void createMissionEventPublish() {
        // given
        Long userId =  userRepository.save(User.createBasicUser("test@mm.com"));
        Long startLocationId = locationRepository.save(Location.builder().locationName("start").build());
        Long endLocationId = locationRepository.save(Location.builder().locationName("end").build());

        CreateMissionServiceRequestDto requestDto = CreateMissionServiceRequestDto.builder()
                .userId(userId)
                .startLocationId(startLocationId)
                .endLocationId(endLocationId)
                .build();

        // when
        Long missionId = missionService.createMission(requestDto).getMissionId();

        // then

        long count = events.stream(MissionCreateEvent.class).count();
        assertThat(count).isEqualTo(1);

        MissionCreateEvent event = events.stream(MissionCreateEvent.class)
                .findFirst()
                .orElseThrow();
        assertThat(event.missionId()).isEqualTo(missionId);
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}