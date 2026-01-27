package com.e101.carryporter.domain.robot.repository;

import com.e101.carryporter.domain.robot.entity.RobotState;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.e101.carryporter.support.IntegrationTestSupport;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class RobotRedisRepositoryTest extends IntegrationTestSupport {

    private static final String AVAILABLE_ROBOTS_KEY = "robot:available";
    private static final String ROBOT_STATUS_PREFIX = "robot:status:";

    @Autowired
    RobotRedisRepository robotRedisRepository;

    @Autowired
    RedisTemplate<String, Object> redisTemplate;

    @AfterEach
    void tearDown() {
        Optional.ofNullable(redisTemplate.getConnectionFactory())
                .map(RedisConnectionFactory::getConnection)
                .ifPresent(conn -> conn.serverCommands().flushDb());
    }

    @Nested
    @DisplayName("MAC 주소 - Robot ID 매핑")
    class MacMappingTest {

        @DisplayName("MAC 주소와 Robot ID를 매핑하여 저장하고 조회할 수 있다")
        @Test
        void saveMacMapping() {
            // given
            String macAddress = "AA:BB:CC:DD";
            Long robotId = 1L;

            // when
            robotRedisRepository.saveMacMapping(macAddress, robotId);
            Optional<Long> result = robotRedisRepository.getRobotIdByMacAddress(macAddress);

            // then
            assertThat(result).isPresent();
            assertThat(result.get()).isEqualTo(robotId);
        }

        @DisplayName("같은 MAC 주소에 여러 Robot ID를 저장하면 마지막 값으로 덮어쓴다")
        @Test
        void saveMacMappingOverwrite() {
            // given
            String macAddress = "AA:BB:CC:DD";
            Long firstId = 1L;
            Long secondId = 2L;

            // when
            robotRedisRepository.saveMacMapping(macAddress, firstId);
            robotRedisRepository.saveMacMapping(macAddress, secondId);
            Optional<Long> result = robotRedisRepository.getRobotIdByMacAddress(macAddress);

            // then
            assertThat(result).isPresent();
            assertThat(result.get()).isEqualTo(secondId);
        }

        @DisplayName("존재하지 않는 MAC 주소로 조회하면 빈 Optional을 반환한다")
        @Test
        void getRobotIdByMacAddressNotFound() {
            // given
            String notExistMacAddress = "AA:BB:CC:DD";

            // when
            Optional<Long> result = robotRedisRepository.getRobotIdByMacAddress(notExistMacAddress);

            // then
            assertThat(result).isEmpty();
        }

        @DisplayName("MAC 주소 매핑을 삭제할 수 있다")
        @Test
        void deleteMacMapping() {
            // given
            String macAddress = "AA:BB:CC:DD";
            Long robotId = 1L;
            robotRedisRepository.saveMacMapping(macAddress, robotId);

            // when
            robotRedisRepository.deleteMacMapping(macAddress);
            Optional<Long> result = robotRedisRepository.getRobotIdByMacAddress(macAddress);

            // then
            assertThat(result).isEmpty();
        }

        @DisplayName("존재하지 않는 MAC 주소를 삭제해도 예외가 발생하지 않는다")
        @Test
        void deleteMacMappingNotFound() {
            // given
            String notExistMacAddress = "AA:BB:CC:DD";

            // when & then (예외 없이 정상 실행)
            robotRedisRepository.deleteMacMapping(notExistMacAddress);
        }
    }

    @Nested
    @DisplayName("로봇 상태 저장/조회")
    class RobotStateTest {

        @DisplayName("로봇 상태를 저장하고 조회할 수 있다")
        @Test
        void saveAndGetRobotState() {
            // given
            Long robotId = 1L;
            String macAddress = "AA:BB:CC:DD";
            RobotState robotState = RobotState.of(macAddress, RobotStatus.IDLE, 100);

            // when
            robotRedisRepository.saveRobotState(robotId, robotState);
            Optional<RobotState> result = robotRedisRepository.getRobotState(robotId);

            // then
            assertThat(result).isPresent();
            RobotState savedState = result.get();
            assertThat(savedState.getMacAddress()).isEqualTo(macAddress);
            assertThat(savedState.getStatus()).isEqualTo(RobotStatus.IDLE);
            assertThat(savedState.getBattery()).isEqualTo(100);
        }

        @DisplayName("존재하지 않는 Robot ID로 상태 조회 시 빈 Optional을 반환한다")
        @Test
        void getRobotStateNotFound() {
            // given
            Long notExistRobotId = 999L;

            // when
            Optional<RobotState> result = robotRedisRepository.getRobotState(notExistRobotId);

            // then
            assertThat(result).isEmpty();
        }

        @DisplayName("로봇 상태를 업데이트할 수 있다")
        @Test
        void updateRobotState() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100);
            robotRedisRepository.saveRobotState(robotId, initialState);

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.RESERVED, 80);
            Optional<RobotState> result = robotRedisRepository.getRobotState(robotId);

            // then
            assertThat(result).isPresent();
            RobotState updatedState = result.get();
            assertThat(updatedState.getStatus()).isEqualTo(RobotStatus.RESERVED);
            assertThat(updatedState.getBattery()).isEqualTo(80);
        }

        @DisplayName("macAddress는 업데이트 시 유지된다")
        @Test
        void updateRobotStatePreservesMacAddress() {
            // given
            Long robotId = 1L;
            String macAddress = "AA:BB:CC:DD";
            RobotState initialState = RobotState.of(macAddress, RobotStatus.IDLE, 100);
            robotRedisRepository.saveRobotState(robotId, initialState);

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.MOVING, 90);
            Optional<RobotState> result = robotRedisRepository.getRobotState(robotId);

            // then
            assertThat(result).isPresent();
            assertThat(result.get().getMacAddress()).isEqualTo(macAddress);
        }
    }

    @Nested
    @DisplayName("Lua 스크립트 - updateRobotState 가용 로봇 큐 관리")
    class UpdateRobotStateLuaScriptTest {

        @DisplayName("IDLE 상태로 업데이트하면 가용 로봇 큐에 추가된다")
        @Test
        void updateToIdleAddsToAvailableQueue() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.OFFLINE, 100);
            robotRedisRepository.saveRobotState(robotId, initialState);
            System.out.println("로봇 상태 저장 완료");
            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            System.out.println("로봇 상태 업데이트 완료");
            // then

            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isTrue();
        }

        @DisplayName("RETURNED 상태로 업데이트하면 가용 로봇 큐에 추가된다")
        @Test
        void updateToReturnedAddsToAvailableQueue() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.RETURNING, 100);
            robotRedisRepository.saveRobotState(robotId, initialState);

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.RETURNED, 100);

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isTrue();
        }

        @DisplayName("RESERVED 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToReservedRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100);
            robotRedisRepository.saveRobotState(robotId, initialState);
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isTrue();

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.RESERVED, 100);

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();
        }

        @DisplayName("MOVING 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToMovingRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100);
            robotRedisRepository.saveRobotState(robotId, initialState);
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.MOVING, 90);

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();
        }

        @DisplayName("WAITING_AUTH 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToWaitingAuthRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.WAITING_AUTH, 85);

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();
        }

        @DisplayName("LOADING 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToLoadingRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.LOADING, 80);

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();
        }

        @DisplayName("LOCKED 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToLockedRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.LOCKED, 100);

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();
        }

        @DisplayName("RETURNING 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToReturningRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.RETURNING, 70);

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();
        }

        @DisplayName("OFFLINE 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToOfflineRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            // when
            robotRedisRepository.updateRobotState(robotId, RobotStatus.OFFLINE, 100);

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();
        }

        @DisplayName("큐에 없는 로봇을 비가용 상태로 업데이트해도 예외가 발생하지 않는다")
        @Test
        void updateToNonAvailableStatusWhenNotInQueue() {
            // given
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.OFFLINE, 100));

            // when & then (예외 없이 정상 실행)
            robotRedisRepository.updateRobotState(robotId, RobotStatus.MOVING, 90);
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();
        }

        @DisplayName("여러 로봇을 IDLE로 업데이트하면 모두 가용 큐에 추가된다")
        @Test
        void updateMultipleRobotsToIdle() {
            // given
            Long robotId1 = 1L;
            Long robotId2 = 2L;
            Long robotId3 = 3L;

            robotRedisRepository.saveRobotState(robotId1, RobotState.of("AA:BB:CC:01", RobotStatus.OFFLINE, 100));
            robotRedisRepository.saveRobotState(robotId2, RobotState.of("AA:BB:CC:02", RobotStatus.OFFLINE, 95));
            robotRedisRepository.saveRobotState(robotId3, RobotState.of("AA:BB:CC:03", RobotStatus.OFFLINE, 90));

            // when
            robotRedisRepository.updateRobotState(robotId1, RobotStatus.IDLE, 100);
            robotRedisRepository.updateRobotState(robotId2, RobotStatus.IDLE, 95);
            robotRedisRepository.updateRobotState(robotId3, RobotStatus.IDLE, 90);

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId1)).isTrue();
            assertThat(robotRedisRepository.isRobotAvailable(robotId2)).isTrue();
            assertThat(robotRedisRepository.isRobotAvailable(robotId3)).isTrue();
        }
    }

    @Nested
    @DisplayName("Lua 스크립트 - assignRobot 로봇 할당")
    class AssignRobotLuaScriptTest {

        @DisplayName("할당된 로봇의 상태가 RESERVED로 변경된다")
        @Test
        void assignRobotChangesStatusToReserved() {
            // given
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            // when
            Optional<Long> assignedRobotId = robotRedisRepository.assignRobot();

            // then
            assertThat(assignedRobotId).isPresent();
            assertThat(assignedRobotId.get()).isEqualTo(robotId);

            Optional<RobotState> state = robotRedisRepository.getRobotState(robotId);
            assertThat(state).isPresent();
            assertThat(state.get().getStatus()).isEqualTo(RobotStatus.RESERVED);
        }

        @DisplayName("할당된 로봇은 가용 큐에서 제거된다")
        @Test
        void assignRobotRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isTrue();

            // when
            robotRedisRepository.assignRobot();

            // then
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();
        }

        @DisplayName("가장 먼저 대기한 로봇이 먼저 할당된다 (FIFO)")
        @Test
        void assignRobotFifoOrder() throws InterruptedException {
            // given
            Long firstRobotId = 1L;
            Long secondRobotId = 2L;
            Long thirdRobotId = 3L;

            robotRedisRepository.saveRobotState(firstRobotId, RobotState.of("AA:BB:CC:01", RobotStatus.OFFLINE, 100));
            robotRedisRepository.saveRobotState(secondRobotId, RobotState.of("AA:BB:CC:02", RobotStatus.OFFLINE, 100));
            robotRedisRepository.saveRobotState(thirdRobotId, RobotState.of("AA:BB:CC:03", RobotStatus.OFFLINE, 100));

            // 순서대로 IDLE 상태로 변경 (시간 간격을 두어 score 차이 발생)
            robotRedisRepository.updateRobotState(firstRobotId, RobotStatus.IDLE, 100);
            Thread.sleep(10);
            robotRedisRepository.updateRobotState(secondRobotId, RobotStatus.IDLE, 100);
            Thread.sleep(10);
            robotRedisRepository.updateRobotState(thirdRobotId, RobotStatus.IDLE, 100);

            // when & then
            Optional<Long> first = robotRedisRepository.assignRobot();
            assertThat(first).contains(firstRobotId);

            Optional<Long> second = robotRedisRepository.assignRobot();
            assertThat(second).contains(secondRobotId);

            Optional<Long> third = robotRedisRepository.assignRobot();
            assertThat(third).contains(thirdRobotId);

            Optional<Long> fourth = robotRedisRepository.assignRobot();
            assertThat(fourth).isEmpty();
        }

        @DisplayName("빈 대기열에서 할당 시도 시 빈 Optional을 반환한다")
        @Test
        void assignRobotEmptyQueue() {
            // given (빈 대기열)

            // when
            Optional<Long> result = robotRedisRepository.assignRobot();

            // then
            assertThat(result).isEmpty();
        }

        @DisplayName("할당 후 battery 값은 유지된다")
        @Test
        void assignRobotPreservesBattery() {
            // given
            Long robotId = 1L;
            int initialBattery = 85;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, initialBattery));
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, initialBattery);

            // when
            robotRedisRepository.assignRobot();

            // then
            Optional<RobotState> state = robotRedisRepository.getRobotState(robotId);
            assertThat(state).isPresent();
            assertThat(state.get().getBattery()).isEqualTo(initialBattery);
        }
    }

    @Nested
    @DisplayName("가용 로봇 대기열 조회")
    class AvailableRobotQueryTest {

        @DisplayName("로봇이 대기열에 있는지 확인할 수 있다")
        @Test
        void isRobotAvailable() {
            // given
            Long availableRobotId = 1L;
            Long notAvailableRobotId = 2L;

            robotRedisRepository.saveRobotState(availableRobotId, RobotState.of("AA:BB:CC:01", RobotStatus.IDLE, 100));
            robotRedisRepository.saveRobotState(notAvailableRobotId, RobotState.of("AA:BB:CC:02", RobotStatus.MOVING, 100));

            robotRedisRepository.updateRobotState(availableRobotId, RobotStatus.IDLE, 100);
            robotRedisRepository.updateRobotState(notAvailableRobotId, RobotStatus.MOVING, 100);

            // when & then
            assertThat(robotRedisRepository.isRobotAvailable(availableRobotId)).isTrue();
            assertThat(robotRedisRepository.isRobotAvailable(notAvailableRobotId)).isFalse();
        }

        @DisplayName("존재하지 않는 로봇 ID로 가용 여부 확인 시 false를 반환한다")
        @Test
        void isRobotAvailableNotExist() {
            // given
            Long notExistRobotId = 999L;

            // when & then
            assertThat(robotRedisRepository.isRobotAvailable(notExistRobotId)).isFalse();
        }
    }

    @Nested
    @DisplayName("통합 시나리오 테스트")
    class IntegrationScenarioTest {

        @DisplayName("로봇 등록부터 할당까지 전체 플로우가 정상 동작한다")
        @Test
        void fullRobotLifecycle() {
            // given - 로봇 등록
            Long robotId = 1L;
            String macAddress = "AA:BB:CC:DD";

            robotRedisRepository.saveMacMapping(macAddress, robotId);
            robotRedisRepository.saveRobotState(robotId, RobotState.of(macAddress, RobotStatus.OFFLINE, 100));

            // when - 로봇이 IDLE 상태로 전환
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            // then - 가용 큐에 추가됨
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isTrue();

            // when - 로봇 할당
            Optional<Long> assignedId = robotRedisRepository.assignRobot();

            // then - 할당 성공 및 상태 RESERVED
            assertThat(assignedId).contains(robotId);
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();

            Optional<RobotState> state = robotRedisRepository.getRobotState(robotId);
            assertThat(state).isPresent();
            assertThat(state.get().getStatus()).isEqualTo(RobotStatus.RESERVED);
        }

        @DisplayName("미션 완료 후 복귀하여 다시 가용 상태가 된다")
        @Test
        void robotReturnAfterMission() {
            // given - 로봇이 미션 수행 중
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.MOVING, 80));

            // when - 미션 완료 후 복귀 중
            robotRedisRepository.updateRobotState(robotId, RobotStatus.RETURNING, 70);
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();

            // when - 스테이션 복귀 완료
            robotRedisRepository.updateRobotState(robotId, RobotStatus.RETURNED, 65);

            // then - 다시 가용 상태
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isTrue();

            Optional<RobotState> state = robotRedisRepository.getRobotState(robotId);
            assertThat(state).isPresent();
            assertThat(state.get().getStatus()).isEqualTo(RobotStatus.RETURNED);
            assertThat(state.get().getBattery()).isEqualTo(65);
        }

        @DisplayName("여러 로봇이 순차적으로 할당되고 복귀한다")
        @Test
        void multipleRobotsAssignAndReturn() throws InterruptedException {
            // given - 3대의 로봇 등록 및 IDLE 상태로 전환
            Long robot1 = 1L;
            Long robot2 = 2L;
            Long robot3 = 3L;

            robotRedisRepository.saveRobotState(robot1, RobotState.of("AA:BB:CC:01", RobotStatus.OFFLINE, 100));
            robotRedisRepository.saveRobotState(robot2, RobotState.of("AA:BB:CC:02", RobotStatus.OFFLINE, 95));
            robotRedisRepository.saveRobotState(robot3, RobotState.of("AA:BB:CC:03", RobotStatus.OFFLINE, 90));

            robotRedisRepository.updateRobotState(robot1, RobotStatus.IDLE, 100);
            Thread.sleep(5);
            robotRedisRepository.updateRobotState(robot2, RobotStatus.IDLE, 95);
            Thread.sleep(5);
            robotRedisRepository.updateRobotState(robot3, RobotStatus.IDLE, 90);

            // when - 첫 번째 로봇 할당
            Optional<Long> assigned1 = robotRedisRepository.assignRobot();
            assertThat(assigned1).contains(robot1);

            // when - 첫 번째 로봇이 복귀하여 다시 가용 상태
            robotRedisRepository.updateRobotState(robot1, RobotStatus.RETURNED, 85);

            // when - 두 번째 로봇 할당 (robot2가 먼저 대기했으므로)
            Optional<Long> assigned2 = robotRedisRepository.assignRobot();
            assertThat(assigned2).contains(robot2);

            // when - 세 번째 로봇 할당
            Optional<Long> assigned3 = robotRedisRepository.assignRobot();
            assertThat(assigned3).contains(robot3);

            // when - 네 번째 할당 시도 (robot1이 복귀했으므로 할당 가능)
            Optional<Long> assigned4 = robotRedisRepository.assignRobot();
            assertThat(assigned4).contains(robot1);
        }

        @DisplayName("비상 정지(LOCKED) 후 해제되면 다시 가용 상태가 된다")
        @Test
        void emergencyStopAndResume() {
            // given - 가용 상태의 로봇
            Long robotId = 1L;
            robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isTrue();

            // when - 비상 정지
            robotRedisRepository.updateRobotState(robotId, RobotStatus.LOCKED, 100);

            // then - 가용 큐에서 제거
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isFalse();

            // when - 비상 정지 해제 후 IDLE로 복귀
            robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);

            // then - 다시 가용 상태
            assertThat(robotRedisRepository.isRobotAvailable(robotId)).isTrue();
        }
    }

    @Nested
    @DisplayName("동시성 테스트")
    class ConcurrencyTest {

        @DisplayName("동시에 여러 요청이 로봇을 할당받아도 각각 다른 로봇이 할당된다")
        @Test
        void concurrentAssignRobot() throws InterruptedException {
            // given - 5대의 로봇을 가용 상태로 등록
            int robotCount = 5;
            for (int i = 1; i <= robotCount; i++) {
                Long robotId = (long) i;
                robotRedisRepository.saveRobotState(robotId, RobotState.of("AA:BB:CC:0" + i, RobotStatus.IDLE, 100));
                robotRedisRepository.updateRobotState(robotId, RobotStatus.IDLE, 100);
                Thread.sleep(5);
            }

            // when - 10개의 스레드가 동시에 할당 요청
            int threadCount = 10;
            ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
            CountDownLatch latch = new CountDownLatch(threadCount);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger failCount = new AtomicInteger(0);

            for (int i = 0; i < threadCount; i++) {
                executorService.execute(() -> {
                    try {
                        Optional<Long> assigned = robotRedisRepository.assignRobot();
                        if (assigned.isPresent()) {
                            successCount.incrementAndGet();
                        } else {
                            failCount.incrementAndGet();
                        }
                    } finally {
                        latch.countDown();
                    }
                });
            }

            latch.await();
            executorService.shutdown();

            // then - 5대만 할당 성공, 5개 요청은 실패
            assertThat(successCount.get()).isEqualTo(robotCount);
            assertThat(failCount.get()).isEqualTo(threadCount - robotCount);

            // 모든 로봇이 가용 큐에서 제거됨
            for (int i = 1; i <= robotCount; i++) {
                assertThat(robotRedisRepository.isRobotAvailable((long) i)).isFalse();
            }
        }
    }
}
