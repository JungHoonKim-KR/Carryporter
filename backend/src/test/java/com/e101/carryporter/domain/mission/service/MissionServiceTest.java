package com.e101.carryporter.domain.mission.service;

import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.repository.LocationRepository;
import com.e101.carryporter.domain.locker.entity.Locker;
import com.e101.carryporter.domain.locker.entity.UserLockerStatus;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.event.MissionCreatedEvent;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.mission.service.dto.request.CreateMissionServiceRequestDto;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.global.exception.BusinessException;
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

    @Autowired
    com.e101.carryporter.domain.locker.repository.LockerRepository lockerRepository;

    @DisplayName("새 미션을 생성하면 새 미션이 생성되었다는 이벤트가 발행된다.")
    @Test
    void createMission() {

        // given
        User user = User.createUser("test@mm.com");
        Location location = Location.createLocation("Gate A12", "탑승구 A12");

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

    @DisplayName("미션 실패 시 미션 상태가 FAILED로 변경된다.")
    @Test
    void failMission() {
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

        // when
        missionService.failMission(missionId);
        flushAndClear();

        // then
        Mission failedMission = missionRepository.findById(missionId).orElseThrow();
        assertThat(failedMission.getMissionStatus()).isEqualTo(com.e101.carryporter.domain.mission.entity.MissionStatus.FAILED);
    }

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
        missionService.assignLocker(missionId, lockerId);
        flushAndClear();

        // then
        Mission mission = missionRepository.findById(missionId).orElseThrow();
        assertThat(mission.getLocker()).isNotNull();
        assertThat(mission.getLocker().getId()).isEqualTo(lockerId);
        assertThat(mission.getLocker().getLockerCode()).isEqualTo("LOCKER-001");
        assertThat(mission.getLockerAssignedAt()).isNotNull();
        assertThat(mission.getUserLockerStatus()).isEqualTo(UserLockerStatus.OCCUPIED);
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
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> missionService.assignLocker(nonExistentMissionId, lockerId))
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
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> missionService.assignLocker(missionId, nonExistentLockerId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("사물함을 찾을 수 없습니다");
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}