package com.e101.carryporter.domain.mission.service;

import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.repository.LocationRepository;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.event.MissionCreatedEvent;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.mission.service.dto.request.CreateMissionServiceRequestDto;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.event.ApplicationEvents;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class MissionServiceTest extends IntegrationTestSupport {

    @Autowired
    MissionService missionService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LocationRepository locationRepository;

    @Autowired
    EntityManager em;

    @Autowired
    MissionRepository missionRepository;

    @Autowired
    ApplicationEvents events;

    @DisplayName("새 미션을 생성하면 새 미션이 생성되었다는 이벤트가 발행된다.")
    @Test
    void createMission() {

        // given
        User user = User.createUser("test@mm.com");
        Location location = Location.createLocation("Gate A12", "탑승구 A12", 1.0, 2.0);

        Long userId = userRepository.save(user);
        Long locationId = locationRepository.save(location);

        CreateMissionServiceRequestDto request = CreateMissionServiceRequestDto.builder()
                .callLocationId(locationId)
                .build();

        // when
        Long missionId = missionService.createMission(userId, request);
        flushAndClear();

        Optional<Mission> missionOpt = missionRepository.findById(missionId);

        // then
        assertThat(missionOpt).isPresent();
        assertThat(missionOpt.get().getUser().getMmEmail()).isEqualTo(user.getMmEmail());
        assertThat(missionOpt.get().getUser().getId()).isEqualTo(userId);
        assertThat(missionOpt.get().getCallLocation().getLocationName()).isEqualTo(location.getLocationName());

        Long eventCount = events.stream(MissionCreatedEvent.class).count();
        assertThat(eventCount).isEqualTo(1);

        MissionCreatedEvent publishedEvent = events.stream(MissionCreatedEvent.class)
                .findFirst()
                .orElseThrow();

        assertThat(publishedEvent.missionId()).isEqualTo(missionId);
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}