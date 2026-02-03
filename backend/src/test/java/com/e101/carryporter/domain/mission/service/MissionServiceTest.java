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