package com.carryporter.carryporter.domain.mission.repository;

import com.carryporter.carryporter.domain.location.entity.Location;
import com.carryporter.carryporter.domain.location.repository.LocationRepository;
import com.carryporter.carryporter.domain.mission.entity.Mission;
import com.carryporter.carryporter.domain.user.entity.User;
import com.carryporter.carryporter.domain.user.repository.UserRepository;
import com.carryporter.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class MissionRepositoryTest extends IntegrationTestSupport {

    @Autowired
    LocationRepository locationRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    MissionRepository missionRepository;

    @Autowired
    EntityManager em;

    @DisplayName("mission 을 저장할 수 있다.")
    @Test
    void save() {
        // given
        User user = User.createBasicUser("test@mm.com");
        Location startLocation = createLocation("start point", "test start");
        Location endLocation = createLocation("end point", "test end");

        userRepository.save(user);
        locationRepository.save(startLocation);
        locationRepository.save(endLocation);

        Mission mission = Mission.createMission(user, startLocation, endLocation);
        Long savedId = missionRepository.save(mission);

        flushAndClear();

        // when
        Mission findMission = missionRepository.findById(savedId)
                .orElseThrow(EntityNotFoundException::new);

        // then
        assertThat(findMission.getUser().getMmEmail()).isEqualTo(user.getMmEmail());
        assertThat(findMission.getStartLocation().getLocationName()).isEqualTo(startLocation.getLocationName());
        assertThat(findMission.getEndLocation().getLocationName()).isEqualTo(endLocation.getLocationName());
    }

    @DisplayName("존재하지 않는 Mission id 로 조회할 경우 빈 optional 이 반환된다.")
    @Test
    void findByNotExistsId() {
        // given
        Long notExistsMissionId = 9999L;

        // when
        Optional<Mission> findMissionOpt = missionRepository.findById(notExistsMissionId);

        // then
        assertThat(findMissionOpt).isEmpty();
    }

    private Location createLocation(String locationName, String description) {
        return Location.builder()
                .locationName(locationName)
                .description(description)
                .build();
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }

}