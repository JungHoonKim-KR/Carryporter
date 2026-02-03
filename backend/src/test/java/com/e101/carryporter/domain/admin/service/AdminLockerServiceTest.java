package com.e101.carryporter.domain.admin.service;

import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.repository.LocationRepository;
import com.e101.carryporter.domain.locker.entity.Locker;
import com.e101.carryporter.domain.locker.entity.LockerStatus;
import com.e101.carryporter.domain.locker.entity.UserLockerStatus;
import com.e101.carryporter.domain.locker.repository.LockerRepository;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.mission.service.MissionService;
import com.e101.carryporter.domain.mission.service.dto.request.CreateMissionServiceRequestDto;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.global.exception.BusinessException;
import com.e101.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AdminLockerServiceTest extends IntegrationTestSupport {

    @Autowired
    AdminLockerService adminLockerService;

    @Autowired
    MissionService missionService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LocationRepository locationRepository;

    @Autowired
    LockerRepository lockerRepository;

    @Autowired
    MissionRepository missionRepository;

    @Autowired
    EntityManager em;

    @DisplayName("미션에 사물함을 배정하면 사물함이 정상적으로 할당된다.")
    @Test
    void assignLocker() {
        // given
        User user = User.createUser("test@mm.com");
        Location location = Location.createLocation("Gate A12", "탑승구 A12");
        Locker locker = Locker.createLocker("LOCKER-001");

        Long userId = userRepository.save(user);
        Long locationId = locationRepository.save(location);
        Long lockerId = lockerRepository.save(locker);

        CreateMissionServiceRequestDto request = CreateMissionServiceRequestDto.builder()
                .callLocationId(locationId)
                .build();

        Long missionId = missionService.createMission(userId, request);
        flushAndClear();

        // when
        adminLockerService.assignLocker(missionId, lockerId);
        flushAndClear();

        // then
        Mission mission = missionRepository.findById(missionId).orElseThrow();
        assertThat(mission.getLocker()).isNotNull();
        assertThat(mission.getLocker().getId()).isEqualTo(lockerId);
        assertThat(mission.getLocker().getLockerCode()).isEqualTo("LOCKER-001");
        assertThat(mission.getLockerAssignedAt()).isNotNull();
        assertThat(mission.getUserLockerStatus()).isEqualTo(UserLockerStatus.OCCUPIED);

        // locker 상태가 OCCUPIED로 변경되었는지 확인
        assertThat(mission.getLocker().getLockerStatus()).isEqualTo(LockerStatus.OCCUPIED);
    }

    @DisplayName("존재하지 않는 미션에 사물함을 배정하면 예외가 발생한다.")
    @Test
    void assignLockerToNonExistentMission() {
        // given
        Locker locker = Locker.createLocker("LOCKER-001");
        Long lockerId = lockerRepository.save(locker);
        flushAndClear();

        Long nonExistentMissionId = 999L;

        // when & then
        assertThatThrownBy(() -> adminLockerService.assignLocker(nonExistentMissionId, lockerId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("미션을 찾을 수 없습니다");
    }

    @DisplayName("미션에 존재하지 않는 사물함을 배정하면 예외가 발생한다.")
    @Test
    void assignNonExistentLockerToMission() {
        // given
        User user = User.createUser("test@mm.com");
        Location location = Location.createLocation("Gate A12", "탑승구 A12");

        Long userId = userRepository.save(user);
        Long locationId = locationRepository.save(location);

        CreateMissionServiceRequestDto request = CreateMissionServiceRequestDto.builder()
                .callLocationId(locationId)
                .build();

        Long missionId = missionService.createMission(userId, request);
        flushAndClear();

        Long nonExistentLockerId = 999L;

        // when & then
        assertThatThrownBy(() -> adminLockerService.assignLocker(missionId, nonExistentLockerId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("사물함을 찾을 수 없습니다");
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}
