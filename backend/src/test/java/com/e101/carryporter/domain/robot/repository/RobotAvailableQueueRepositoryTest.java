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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class RobotAvailableQueueRepositoryTest extends IntegrationTestSupport {

    @Autowired
    RobotAvailableQueueRepository robotAvailableQueueRepository;

    @Autowired
    RobotStateRepository robotStateRepository;

    @Autowired
    RedisTemplate<String, Object> redisTemplate;

    private static final String AVAILABLE_ROBOTS_KEY = "robot:available";

    @AfterEach
    void tearDown() {
        Optional.ofNullable(redisTemplate.getConnectionFactory())
                .map(RedisConnectionFactory::getConnection)
                .ifPresent(conn -> conn.serverCommands().flushDb());
    }

    @Nested
    @DisplayName("로봇 배정")
    class AcquireRobotIdTest {

        @DisplayName("큐에 로봇이 있으면 로봇 ID를 반환하고 상태를 RESERVED로 변경한다")
        @Test
        void acquireRobotIdSuccess() {
            // given
            Long robotId = 1L;
            String macAddress = "AA:BB:CC:DD";
            RobotState robotState = RobotState.of(macAddress, RobotStatus.IDLE, 100);
            robotStateRepository.save(robotId, robotState);

            redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId);

            // when
            Optional<Long> result = robotAvailableQueueRepository.acquireRobotId();

            // then
            assertThat(result).isPresent();
            assertThat(result.get()).isEqualTo(robotId);

            Optional<RobotState> updatedState = robotStateRepository.findById(robotId);
            assertThat(updatedState).isPresent();
            assertThat(updatedState.get().getStatus()).isEqualTo(RobotStatus.RESERVED);
        }

        @DisplayName("큐에 여러 로봇이 있으면 먼저 들어온 로봇을 반환한다 (FIFO)")
        @Test
        void acquireRobotIdFifo() {
            // given
            Long robotId1 = 1L;
            Long robotId2 = 2L;
            Long robotId3 = 3L;

            RobotState robotState1 = RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100);
            RobotState robotState2 = RobotState.of("EE:FF:GG:HH", RobotStatus.IDLE, 90);
            RobotState robotState3 = RobotState.of("II:JJ:KK:LL", RobotStatus.IDLE, 80);

            robotStateRepository.save(robotId1, robotState1);
            robotStateRepository.save(robotId2, robotState2);
            robotStateRepository.save(robotId3, robotState3);

            redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId1);
            redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId2);
            redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId3);

            // when
            Optional<Long> first = robotAvailableQueueRepository.acquireRobotId();
            Optional<Long> second = robotAvailableQueueRepository.acquireRobotId();
            Optional<Long> third = robotAvailableQueueRepository.acquireRobotId();

            // then
            assertThat(first).contains(robotId1);
            assertThat(second).contains(robotId2);
            assertThat(third).contains(robotId3);
        }

        @DisplayName("큐가 비어있으면 타임아웃 후 빈 Optional을 반환한다")
        @Test
        void acquireRobotIdTimeout() {
            // given
            // 큐에 아무것도 없음

            // when
            long startTime = System.currentTimeMillis();
            Optional<Long> result = robotAvailableQueueRepository.acquireRobotId();
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // then
            assertThat(result).isEmpty();
            assertThat(duration).isGreaterThanOrEqualTo(20000); // 20초 이상 대기
            assertThat(duration).isLessThan(25000); // 25초 이내
        }

        @DisplayName("큐에서 대기 중일 때 로봇이 추가되면 즉시 반환한다")
        @Test
        void acquireRobotIdWithDelayedPush() throws InterruptedException {
            // given
            Long robotId = 1L;
            RobotState robotState = RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100);
            robotStateRepository.save(robotId, robotState);

            // 비동기로 2초 후에 큐에 로봇 추가
            CompletableFuture.runAsync(() -> {
                try {
                    Thread.sleep(2000);
                    redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });

            // when
            long startTime = System.currentTimeMillis();
            Optional<Long> result = robotAvailableQueueRepository.acquireRobotId();
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // then
            assertThat(result).isPresent();
            assertThat(result.get()).isEqualTo(robotId);
            assertThat(duration).isGreaterThanOrEqualTo(2000); // 2초 이상
            assertThat(duration).isLessThan(5000); // 5초 이내 (즉시 반환)
        }
    }

    @Nested
    @DisplayName("로봇 반환")
    class ReturnRobotToQueueTest {

        @DisplayName("로봇을 큐에 반환하면 상태가 IDLE로 변경된다")
        @Test
        void returnRobotToQueue() {
            // given
            Long robotId = 1L;
            String macAddress = "AA:BB:CC:DD";
            RobotState robotState = RobotState.of(macAddress, RobotStatus.RESERVED, 100);
            robotStateRepository.save(robotId, robotState);

            // when
            robotAvailableQueueRepository.returnRobotToQueue(robotId);

            // then
            Optional<RobotState> updatedState = robotStateRepository.findById(robotId);
            assertThat(updatedState).isPresent();
            assertThat(updatedState.get().getStatus()).isEqualTo(RobotStatus.IDLE);
        }

        @DisplayName("여러 로봇을 반환하면 모두 IDLE 상태로 변경된다")
        @Test
        void returnMultipleRobots() {
            // given
            Long robotId1 = 1L;
            Long robotId2 = 2L;
            Long robotId3 = 3L;

            RobotState robotState1 = RobotState.of("AA:BB:CC:DD", RobotStatus.RESERVED, 100);
            RobotState robotState2 = RobotState.of("EE:FF:GG:HH", RobotStatus.MOVING, 90);
            RobotState robotState3 = RobotState.of("II:JJ:KK:LL", RobotStatus.WAITING_AUTH, 80);

            robotStateRepository.save(robotId1, robotState1);
            robotStateRepository.save(robotId2, robotState2);
            robotStateRepository.save(robotId3, robotState3);

            // when
            robotAvailableQueueRepository.returnRobotToQueue(robotId1);
            robotAvailableQueueRepository.returnRobotToQueue(robotId2);
            robotAvailableQueueRepository.returnRobotToQueue(robotId3);

            // then
            assertThat(robotStateRepository.findById(robotId1).get().getStatus()).isEqualTo(RobotStatus.IDLE);
            assertThat(robotStateRepository.findById(robotId2).get().getStatus()).isEqualTo(RobotStatus.IDLE);
            assertThat(robotStateRepository.findById(robotId3).get().getStatus()).isEqualTo(RobotStatus.IDLE);
        }
    }

    @Nested
    @DisplayName("통합 시나리오")
    class IntegrationScenarioTest {

        @DisplayName("로봇을 배정받고 사용 후 반환하면 다시 배정받을 수 있다")
        @Test
        void fullCycle() {
            // given
            Long robotId = 1L;
            String macAddress = "AA:BB:CC:DD";
            RobotState robotState = RobotState.of(macAddress, RobotStatus.IDLE, 100);
            robotStateRepository.save(robotId, robotState);
            redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId);

            // when - 첫 번째 배정
            Optional<Long> firstAcquire = robotAvailableQueueRepository.acquireRobotId();
            assertThat(firstAcquire).contains(robotId);
            assertThat(robotStateRepository.findById(robotId).get().getStatus()).isEqualTo(RobotStatus.RESERVED);

            // 로봇 반환
            robotAvailableQueueRepository.returnRobotToQueue(robotId);
            assertThat(robotStateRepository.findById(robotId).get().getStatus()).isEqualTo(RobotStatus.IDLE);

            // Lua Script가 IDLE로 변경 시 큐에 추가한다고 가정하고, 수동으로 큐에 추가
            // (실제로는 Lua Script가 처리)
            redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId);

            // 두 번째 배정
            Optional<Long> secondAcquire = robotAvailableQueueRepository.acquireRobotId();

            // then
            assertThat(secondAcquire).contains(robotId);
            assertThat(robotStateRepository.findById(robotId).get().getStatus()).isEqualTo(RobotStatus.RESERVED);
        }

        @DisplayName("여러 로봇을 동시에 배정하고 반환할 수 있다")
        @Test
        void multipleRobotsCycle() {
            // given
            Long robotId1 = 1L;
            Long robotId2 = 2L;

            RobotState robotState1 = RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100);
            RobotState robotState2 = RobotState.of("EE:FF:GG:HH", RobotStatus.IDLE, 90);

            robotStateRepository.save(robotId1, robotState1);
            robotStateRepository.save(robotId2, robotState2);

            redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId1);
            redisTemplate.opsForList().rightPush(AVAILABLE_ROBOTS_KEY, robotId2);

            // when
            Optional<Long> robot1 = robotAvailableQueueRepository.acquireRobotId();
            Optional<Long> robot2 = robotAvailableQueueRepository.acquireRobotId();

            // then
            assertThat(robot1).contains(robotId1);
            assertThat(robot2).contains(robotId2);
            assertThat(robotStateRepository.findById(robotId1).get().getStatus()).isEqualTo(RobotStatus.RESERVED);
            assertThat(robotStateRepository.findById(robotId2).get().getStatus()).isEqualTo(RobotStatus.RESERVED);

            // 큐가 비어있어야 함
            Long queueSize = redisTemplate.opsForList().size(AVAILABLE_ROBOTS_KEY);
            assertThat(queueSize).isEqualTo(0);
        }
    }
}
