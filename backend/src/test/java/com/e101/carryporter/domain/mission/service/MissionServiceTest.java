package com.e101.carryporter.domain.mission.service;

import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.repository.LocationRepository;
import com.e101.carryporter.domain.locker.entity.Locker;
import com.e101.carryporter.domain.locker.entity.LockerStatus;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.entity.MissionStatus;
import com.e101.carryporter.domain.mission.event.MissionCreatedEvent;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.mission.service.dto.request.CreateMissionServiceRequestDto;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
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
    RobotRepository robotRepository;

    @Autowired
    ApplicationEvents events;

    @DisplayName("새 미션을 생성하면 새 미션이 생성되었다는 이벤트가 isNew=true로 발행된다.")
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
        assertThat(publishedEvent.isNew()).isTrue(); // 새 미션이므로 true
    }

    @DisplayName("STORING 상태의 미션이 이미 있으면 새로운 미션을 생성하지 않고 기존 미션을 반환하며 isNew=false로 이벤트가 발행된다.")
    @Test
    void createMissionWithExistingStoringMission() {
        // given
        User user = User.createUser("test@mm.com");
        Location location1 = Location.createLocation("Gate A12", "탑승구 A12");
        Location location2 = Location.createLocation("Gate B5", "탑승구 B5");

        userRepository.save(user);
        locationRepository.save(location1);
        Long locationId2 = locationRepository.save(location2);

        // STORING 상태의 미션을 미리 생성
        Mission existingMission = Mission.createMission(user, location1);
        Long existingMissionId = missionRepository.save(existingMission);

        // 미션을 STORING 상태로 변경
        Mission savedMission = missionRepository.findById(existingMissionId).orElseThrow();
        em.createQuery("UPDATE Mission m SET m.missionStatus = :status WHERE m.id = :id")
                .setParameter("status", MissionStatus.STORING)
                .setParameter("id", existingMissionId)
                .executeUpdate();
        flushAndClear();

        CreateMissionServiceRequestDto request = CreateMissionServiceRequestDto.builder()
                .callLocationId(locationId2)
                .build();

        // when
        Long returnedMissionId = missionService.createMission(user.getId(), request);
        flushAndClear();

        // then
        assertThat(returnedMissionId).isEqualTo(existingMissionId);

        Mission mission = missionRepository.findById(returnedMissionId).orElseThrow();
        assertThat(mission.getMissionStatus()).isEqualTo(MissionStatus.STORING);
        assertThat(mission.getCallLocation().getId()).isEqualTo(location1.getId()); // 기존 위치 유지

        // MissionCreatedEvent 검증
        Long eventCount = events.stream(MissionCreatedEvent.class).count();
        assertThat(eventCount).isEqualTo(1);

        MissionCreatedEvent publishedEvent = events.stream(MissionCreatedEvent.class)
                .findFirst()
                .orElseThrow();

        assertThat(publishedEvent.missionId()).isEqualTo(existingMissionId);
        assertThat(publishedEvent.isNew()).isFalse(); // 기존 미션이므로 false
    }

    @DisplayName("STORING 상태의 미션이 없으면 새로운 미션을 생성하고 isNew=true로 이벤트가 발행된다.")
    @Test
    void createMissionWithoutStoringMission() {
        // given
        User user = User.createUser("test@mm.com");
        Location location1 = Location.createLocation("Gate A12", "탑승구 A12");
        Location location2 = Location.createLocation("Gate B5", "탑승구 B5");

        userRepository.save(user);
        locationRepository.save(location1);
        Long locationId2 = locationRepository.save(location2);

        // REQUESTED 상태의 미션만 있음 (STORING 아님)
        // repository에 직접 저장하므로 이벤트 발생하지 않음
        Mission requestedMission = Mission.createMission(user, location1);
        missionRepository.save(requestedMission);
        flushAndClear();

        CreateMissionServiceRequestDto request = CreateMissionServiceRequestDto.builder()
                .callLocationId(locationId2)
                .build();

        // when
        Long newMissionId = missionService.createMission(user.getId(), request);
        flushAndClear();

        // then
        Mission newMission = missionRepository.findById(newMissionId).orElseThrow();
        assertThat(newMission.getMissionStatus()).isEqualTo(MissionStatus.REQUESTED);
        assertThat(newMission.getCallLocation().getId()).isEqualTo(locationId2);

        // MissionCreatedEvent 검증
        long eventCount = events.stream(MissionCreatedEvent.class).count();
        assertThat(eventCount).isEqualTo(1); // missionService.createMission만 호출했으므로 1번

        MissionCreatedEvent publishedEvent = events.stream(MissionCreatedEvent.class)
                .findFirst()
                .orElseThrow();

        assertThat(publishedEvent.missionId()).isEqualTo(newMissionId);
        assertThat(publishedEvent.isNew()).isTrue(); // 새 미션이므로 true
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
        assertThat(failedMission.getMissionStatus()).isEqualTo(MissionStatus.FAILED);
    }

    @DisplayName("미션 종료 시 locker 상태가 AVAILABLE로 변경된다.")
    @Test
    void finishMissionReleasesLocker() {
        // given
        User user = User.createUser("test@mm.com");
        em.persist(user);

        Location location = Location.createLocation("Gate A12", "탑승구 A12");
        em.persist(location);

        Robot robot = Robot.createRobot("R-001", "AA:BB:CC:DD:EE:FF");
        em.persist(robot);

        Locker locker = Locker.createLocker("L001");
        em.persist(locker);

        Mission mission = Mission.createMission(user, location);
        mission.assignRobot(robot);
        mission.assignLocker(locker);
        // 서비스 레이어에서 locker 상태 변경하는 것을 시뮬레이션
        locker.updateStatus(LockerStatus.OCCUPIED);
        missionRepository.save(mission);

        flushAndClear();

        // when
        missionService.finish(mission.getId(), robot.getId());
        flushAndClear();

        // then
        Mission finishedMission = missionRepository.findById(mission.getId()).orElseThrow();
        assertThat(finishedMission.getMissionStatus()).isEqualTo(MissionStatus.FINISHED);

        Locker releasedLocker = em.find(Locker.class, locker.getId());
        assertThat(releasedLocker.getLockerStatus()).isEqualTo(LockerStatus.AVAILABLE);

        Robot idleRobot = robotRepository.findById(robot.getId()).orElseThrow();
        assertThat(idleRobot.getRobotStatus()).isEqualTo(RobotStatus.IDLE);
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}