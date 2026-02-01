package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.location.repository.LocationRepository;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.entity.MissionStatus;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.entity.RobotState;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.e101.carryporter.domain.robot.event.RobotAssignedEvent;
import com.e101.carryporter.domain.robot.exception.RobotErrorCode;
import com.e101.carryporter.domain.robot.repository.RobotAvailableQueueRepository;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.domain.robot.repository.RobotStateRepository;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.global.exception.BusinessException;
import com.e101.carryporter.support.IntegrationTestSupport;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RobotAssignServiceTest extends IntegrationTestSupport {

    @Autowired
    private RobotAssignService robotAssignService;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private RobotRepository robotRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private RobotAvailableQueueRepository robotAvailableQueueRepository;

    @Autowired
    private RobotStateRepository robotStateRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String AVAILABLE_ROBOTS_KEY = "robot:available";

    @AfterEach
    void tearDown() {
        // Redis의 모든 데이터를 삭제하여 각 테스트가 독립적으로 실행되도록 보장
        Optional.ofNullable(redisTemplate.getConnectionFactory())
                .map(RedisConnectionFactory::getConnection)
                .ifPresent(conn -> conn.serverCommands().flushDb());
    }

    @DisplayName("로봇 배정 성공 시 미션과 로봇의 상태가 올바르게 변경되고 이벤트가 발행된다")
    @Test
    void assignRobotToMission_Success() {
        // given
        // 1. User 생성
        User user = User.createUser("test@example.com");
        userRepository.save(user);

        // 2. Location 생성
        Location location = Location.createLocation("TestLocation", "Test Description");
        locationRepository.save(location);

        // 3. Mission 생성 (REQUESTED 상태)
        Mission mission = Mission.createMission(user, location);
        Long missionId = missionRepository.save(mission);

        // 4. Robot 생성 (IDLE 상태)
        Robot robot = Robot.createRobot("ROBOT-001", "AA:BB:CC:DD:EE:FF");
        Long robotId = robotRepository.save(robot);

        // 5. Redis에 로봇 상태 저장
        RobotState robotState = RobotState.of("AA:BB:CC:DD:EE:FF", RobotStatus.IDLE, 100);
        robotStateRepository.save(robotId, robotState);

        // 6. Redis 큐에 로봇 추가
        redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId);

        // when
        Long assignedRobotId = robotAssignService.assignRobotToMission(missionId);

        // then
        // 1. 배정된 로봇 ID 확인
        assertThat(assignedRobotId).isEqualTo(robotId);

        // 2. Mission 상태 확인 (REQUESTED → ASSIGNED)
        Mission updatedMission = missionRepository.findById(missionId).orElseThrow();
        assertThat(updatedMission.getMissionStatus()).isEqualTo(MissionStatus.ASSIGNED);
        assertThat(updatedMission.getRobot()).isNotNull();
        assertThat(updatedMission.getRobot().getId()).isEqualTo(robotId);
        assertThat(updatedMission.getAssignedAt()).isNotNull();

        // 3. Robot 상태 확인 (IDLE → BUSY)
        Robot updatedRobot = robotRepository.findById(robotId).orElseThrow();
        assertThat(updatedRobot.getRobotStatus()).isEqualTo(RobotStatus.BUSY);

        // 4. Redis 큐가 비어있는지 확인
        Long queueSize = redisTemplate.opsForList().size(AVAILABLE_ROBOTS_KEY);
        assertThat(queueSize).isEqualTo(0);

        // 5. RobotAssignedEvent 발행 확인
        long eventCount = events.stream(RobotAssignedEvent.class).count();
        assertThat(eventCount).isEqualTo(1);

        RobotAssignedEvent publishedEvent = events.stream(RobotAssignedEvent.class)
                .findFirst()
                .orElseThrow();
        assertThat(publishedEvent.userId()).isEqualTo(user.getId());
        assertThat(publishedEvent.robotCode()).isEqualTo("ROBOT-001");
    }

    @DisplayName("가용 로봇이 없을 때 예외가 발생한다")
    @Test
    void assignRobotToMission_NoAvailableRobot() {
        // given
        // 1. User 생성
        User user = User.createUser("test@example.com");
        userRepository.save(user);

        // 2. Location 생성
        Location location = Location.createLocation("TestLocation", "Test Description");
        locationRepository.save(location);

        // 3. Mission 생성 (REQUESTED 상태)
        Mission mission = Mission.createMission(user, location);
        Long missionId = missionRepository.save(mission);

        // 4. Redis 큐가 비어있음 (가용 로봇 없음)

        // when & then
        // 20초 타임아웃 후 ROBOT_NOT_AVAILABLE 예외 발생
        assertThatThrownBy(() -> robotAssignService.assignRobotToMission(missionId))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", RobotErrorCode.ROBOT_NOT_AVAILABLE);

        // Mission 상태가 REQUESTED로 유지되는지 확인
        Mission unchangedMission = missionRepository.findById(missionId).orElseThrow();
        assertThat(unchangedMission.getMissionStatus()).isEqualTo(MissionStatus.REQUESTED);
        assertThat(unchangedMission.getRobot()).isNull();

        // 이벤트가 발행되지 않았는지 확인
        long eventCount = events.stream(RobotAssignedEvent.class).count();
        assertThat(eventCount).isEqualTo(0);
    }

    @DisplayName("로봇 배정 실패 시 로봇이 큐에 반납된다")
    @Test
    void assignRobotToMission_RollbackOnError() {
        // given
        // 1. Location 생성
        Location location = Location.createLocation("TestLocation", "Test Description");
        locationRepository.save(location);

        // 2. Mission 생성하지 않음 (존재하지 않는 missionId 사용)
        Long invalidMissionId = 999L;

        // 3. Robot 생성 (IDLE 상태)
        Robot robot = Robot.createRobot("ROBOT-001", "AA:BB:CC:DD:EE:FF");
        Long robotId = robotRepository.save(robot);

        // 4. Redis에 로봇 상태 저장
        RobotState robotState = RobotState.of("AA:BB:CC:DD:EE:FF", RobotStatus.IDLE, 100);
        robotStateRepository.save(robotId, robotState);

        // 5. Redis 큐에 로봇 추가
        redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId);

        // when & then
        // 존재하지 않는 미션에 대한 로봇 배정 시도 시 예외 발생
        assertThatThrownBy(() -> robotAssignService.assignRobotToMission(invalidMissionId))
                .isInstanceOf(BusinessException.class);

        // 로봇이 다시 IDLE 상태로 변경되었는지 확인
        Optional<RobotState> IDLERobotState = robotStateRepository.findById(robotId);
        assertThat(IDLERobotState).isPresent();
        assertThat(IDLERobotState.get().getStatus()).isEqualTo(RobotStatus.IDLE);

        // 이벤트가 발행되지 않았는지 확인
        long eventCount = events.stream(RobotAssignedEvent.class).count();
        assertThat(eventCount).isEqualTo(0);
    }

    @DisplayName("여러 로봇을 순차적으로 배정할 수 있다")
    @Test
    void assignRobotToMission_MultipleAssignments() {
        // given
        // 1. User 생성
        User user = User.createUser("test@example.com");
        userRepository.save(user);

        // 2. Location 생성
        Location location = Location.createLocation("TestLocation", "Test Description");
        locationRepository.save(location);

        // 3. 두 개의 Mission 생성
        Mission mission1 = Mission.createMission(user, location);
        Long missionId1 = missionRepository.save(mission1);

        Mission mission2 = Mission.createMission(user, location);
        Long missionId2 = missionRepository.save(mission2);

        // 4. 두 개의 Robot 생성
        Robot robot1 = Robot.createRobot("ROBOT-001", "AA:BB:CC:DD:EE:01");
        Long robotId1 = robotRepository.save(robot1);

        Robot robot2 = Robot.createRobot("ROBOT-002", "AA:BB:CC:DD:EE:02");
        Long robotId2 = robotRepository.save(robot2);

        // 5. Redis에 로봇 상태 저장
        RobotState robotState1 = RobotState.of("AA:BB:CC:DD:EE:01", RobotStatus.IDLE, 100);
        robotStateRepository.save(robotId1, robotState1);

        RobotState robotState2 = RobotState.of("AA:BB:CC:DD:EE:02", RobotStatus.IDLE, 90);
        robotStateRepository.save(robotId2, robotState2);

        // 6. Redis 큐에 로봇 추가 (FIFO 순서)
        redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId1);
        redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId2);

        // when
        Long assignedRobotId1 = robotAssignService.assignRobotToMission(missionId1);
        Long assignedRobotId2 = robotAssignService.assignRobotToMission(missionId2);

        // then
        // 1. 첫 번째 배정 확인
        assertThat(assignedRobotId1).isEqualTo(robotId1);
        Mission updatedMission1 = missionRepository.findById(missionId1).orElseThrow();
        assertThat(updatedMission1.getMissionStatus()).isEqualTo(MissionStatus.ASSIGNED);
        assertThat(updatedMission1.getRobot().getId()).isEqualTo(robotId1);

        Robot updatedRobot1 = robotRepository.findById(robotId1).orElseThrow();
        assertThat(updatedRobot1.getRobotStatus()).isEqualTo(RobotStatus.BUSY);

        // 2. 두 번째 배정 확인
        assertThat(assignedRobotId2).isEqualTo(robotId2);
        Mission updatedMission2 = missionRepository.findById(missionId2).orElseThrow();
        assertThat(updatedMission2.getMissionStatus()).isEqualTo(MissionStatus.ASSIGNED);
        assertThat(updatedMission2.getRobot().getId()).isEqualTo(robotId2);

        Robot updatedRobot2 = robotRepository.findById(robotId2).orElseThrow();
        assertThat(updatedRobot2.getRobotStatus()).isEqualTo(RobotStatus.BUSY);

        // 3. Redis 큐가 비어있는지 확인
        Long queueSize = redisTemplate.opsForList().size(AVAILABLE_ROBOTS_KEY);
        assertThat(queueSize).isEqualTo(0);

        // 4. 두 개의 이벤트가 발행되었는지 확인
        long eventCount = events.stream(RobotAssignedEvent.class).count();
        assertThat(eventCount).isEqualTo(2);
    }
}
