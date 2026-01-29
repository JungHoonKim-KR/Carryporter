package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.admin.event.AdminLockRequestEvent;
import com.e101.carryporter.domain.admin.event.AdminUnlockRequestEvent;
import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.repository.LocationRepository;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.event.MissionStartedEvent;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.domain.robot.service.dto.request.MoveServiceRequestDto;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.global.exception.BusinessException;
import com.e101.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.event.ApplicationEvents;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RobotServiceTest extends IntegrationTestSupport {

    @Autowired
    RobotRepository robotRepository;

    @Autowired
    RobotService robotService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    MissionRepository missionRepository;

    @Autowired
    LocationRepository locationRepository;

    @Autowired
    EntityManager em;

    @Autowired
    ApplicationEvents events;

    @DisplayName("로봇을 pk 기반으로 조회할 수 있다.")
    @Test
    void findById() {
        // given
        Robot robot = Robot.createRobot("test code", "aa:bb:cc");
        robotRepository.save(robot);

        flushAndClear();

        // when
        Robot findRobot = robotService.findById(robot.getId());

        // then
        assertThat(findRobot.getRobotCode()).isEqualTo(robot.getRobotCode());
        assertThat(findRobot.getMacAddress()).isEqualTo(robot.getMacAddress());

    }

    @DisplayName("로봇이 없을 경우 예외가 발생한다.")
    @Test
    void findByNotExistsRobotId() {
        // given
        Long notExistsRobotId = 9999L;

        // when then
        assertThatThrownBy(() -> robotService.findById(notExistsRobotId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("해당 로봇을 찾을 수 없습니다.");

    }

    @DisplayName("관리자 잠금 해제 요청이 들어올 경우 잠금해제 할 수 있다.")
    @Test
    void unlockByAdmin() {
        // given
        User user = User.createUser("test@mm.com");
        userRepository.save(user);

        Robot robot = Robot.createRobot("test code", "aa:bb:cc");
        robotRepository.save(robot);

        Location callLocation = Location.createLocation("test location", "description", 1.0, 2.0);
        locationRepository.save(callLocation);

        Mission mission = Mission.createMission(user, callLocation);
        missionRepository.save(mission);

        flushAndClear();

        // when
        robotService.unlockByAdmin(mission.getId(), robot.getId());

        // then
        long publishedCount = events.stream(AdminUnlockRequestEvent.class).count();
        assertThat(publishedCount).isEqualTo(1);

        AdminUnlockRequestEvent publishedEvent = events.stream(AdminUnlockRequestEvent.class)
                .findFirst()
                .orElseThrow();

        assertThat(publishedEvent.missionId()).isEqualTo(mission.getId());
        assertThat(publishedEvent.robotMacAddress()).isEqualTo(robot.getMacAddress());

    }

    @DisplayName("관리자 잠금 요청이 들어올 경우 잠금 할 수 있다.")
    @Test
    void lockByAdmin() {
        // given
        User user = User.createUser("test@mm.com");
        userRepository.save(user);

        Robot robot = Robot.createRobot("test code", "aa:bb:cc");
        robotRepository.save(robot);

        Location callLocation = Location.createLocation("test location", "description", 1.0, 2.0);
        locationRepository.save(callLocation);

        Mission mission = Mission.createMission(user, callLocation);
        missionRepository.save(mission);

        flushAndClear();

        // when
        System.out.println("robot id " + robot.getId());
        robotService.lockByAdmin(mission.getId(), robot.getId());

        // then
        long publishedCount = events.stream(AdminLockRequestEvent.class).count();
        assertThat(publishedCount).isEqualTo(1);

        AdminLockRequestEvent publishedEvent = events.stream(AdminLockRequestEvent.class)
                .findFirst()
                .orElseThrow();

        assertThat(publishedEvent.missionId()).isEqualTo(mission.getId());
        assertThat(publishedEvent.robotMacAddress()).isEqualTo(robot.getMacAddress());

    }

    @DisplayName("관리자 권한 이동 요청이 들어올 경우 MissionStartedEvent 가 발행된다.")
    @Test
    void move() {
        // given
        User user = User.createUser("test@mm.com");
        userRepository.save(user);

        Robot robot = Robot.createRobot("test code", "aa:bb:cc");
        robotRepository.save(robot);

        Location callLocation = Location.createLocation("test location", "description", 1.0, 2.0);
        locationRepository.save(callLocation);

        Mission mission = Mission.createMission(user, callLocation);
        missionRepository.save(mission);

        flushAndClear();

        MoveServiceRequestDto request = MoveServiceRequestDto.builder()
                .robotId(robot.getId())
                .missionId(mission.getId())
                .callLocationId(callLocation.getId())
                .build();

        robotService.move(request);

        // when
        System.out.println("robot id " + robot.getId());

        // then
        long publishedCount = events.stream(MissionStartedEvent.class).count();
        assertThat(publishedCount).isEqualTo(1);

        MissionStartedEvent publishedEvent = events.stream(MissionStartedEvent.class)
                .findFirst()
                .orElseThrow();

        assertThat(publishedEvent.missionId()).isEqualTo(mission.getId());
        assertThat(publishedEvent.robotMacAddress()).isEqualTo(robot.getMacAddress());
        assertThat(publishedEvent.destX()).isEqualTo(callLocation.getPositionX());
        assertThat(publishedEvent.destY()).isEqualTo(callLocation.getPositionY());

    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }

}
