package com.e101.carryporter.domain.mission.repository;

import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.repository.LocationRepository;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.entity.MissionStatus;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class MissionRepositoryTest extends IntegrationTestSupport {

    @Autowired
    MissionRepository missionRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LocationRepository locationRepository;

    @Autowired
    EntityManager em;

    @DisplayName("미션을 저장할 수 있다.")
    @Test
    void saveMission() {
        // given
        User user = User.createUser("test@mm.com");
        userRepository.save(user);

        Location callLocation = Location.createLocation("Gate A12", "탑승구 A12", 1.0, 2.0);
        locationRepository.save(callLocation);

        Mission mission = Mission.createMission(user, callLocation);

        // when
        Long savedId = missionRepository.save(mission);
        flushAndClear();

        Mission findMission = missionRepository.findById(savedId)
                .orElseThrow(() -> new EntityNotFoundException("Mission not found"));

        // then
        assertThat(findMission.getUser().getId()).isEqualTo(user.getId());
        assertThat(findMission.getCallLocation().getId()).isEqualTo(callLocation.getId());
        assertThat(findMission.getMissionStatus()).isEqualTo(MissionStatus.REQUESTED);
    }

    @DisplayName("존재하지 않는 미션의 pk 로 조회시 빈 옵셔널이 반환된다")
    @Test
    void findByNotExistId() {
        // given
        Long notExistMissionId = 99999L;

        // when
        Optional<Mission> missionOpt = missionRepository.findById(notExistMissionId);

        // then
        assertThat(missionOpt).isEmpty();
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }

}
