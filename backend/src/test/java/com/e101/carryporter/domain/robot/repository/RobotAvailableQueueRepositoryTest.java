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
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;

class RobotAvailableQueueRepositoryTest extends IntegrationTestSupport {

    @Autowired
    RobotAvailableQueueRepository robotAvailableQueueRepository;

    @Autowired
    RobotStateRepository robotStateRepository;

    @Autowired
    RobotMacMappingRepository robotMacMappingRepository;

    @Autowired
    RedisTemplate<String, Object> redisTemplate;

    @AfterEach
    void tearDown() {
        Optional.ofNullable(redisTemplate.getConnectionFactory())
                .map(RedisConnectionFactory::getConnection)
                .ifPresent(conn -> conn.serverCommands().flushDb());
    }

    @Nested
    @DisplayName("로봇 상태 업데이트")
    class UpdateStateTest {

        @DisplayName("로봇 상태를 업데이트할 수 있다")
        @Test
        void updateState() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100);
            robotStateRepository.save(robotId, initialState);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.RESERVED, 80);
            Optional<RobotState> result = robotStateRepository.findById(robotId);

            // then
            assertThat(result).isPresent();
            RobotState updatedState = result.get();
            assertThat(updatedState.getStatus()).isEqualTo(RobotStatus.RESERVED);
            assertThat(updatedState.getBattery()).isEqualTo(80);
        }

        @DisplayName("macAddress는 업데이트 시 유지된다")
        @Test
        void updateStatePreservesMacAddress() {
            // given
            Long robotId = 1L;
            String macAddress = "AA:BB:CC:DD";
            RobotState initialState = RobotState.of(macAddress, RobotStatus.IDLE, 100);
            robotStateRepository.save(robotId, initialState);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.MOVING, 90);
            Optional<RobotState> result = robotStateRepository.findById(robotId);

            // then
            assertThat(result).isPresent();
            assertThat(result.get().getMacAddress()).isEqualTo(macAddress);
        }
    }

    @Nested
    @DisplayName("가용 로봇 큐 관리")
    class AvailableQueueManagementTest {

        @DisplayName("IDLE 상태로 업데이트하면 가용 로봇 큐에 추가된다")
        @Test
        void updateToIdleAddsToAvailableQueue() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.OFFLINE, 100);
            robotStateRepository.save(robotId, initialState);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isTrue();
        }

        @DisplayName("RETURNED 상태로 업데이트하면 가용 로봇 큐에 추가된다")
        @Test
        void updateToReturnedAddsToAvailableQueue() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.RETURNING, 100);
            robotStateRepository.save(robotId, initialState);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.RETURNED, 100);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isTrue();
        }

        @DisplayName("RESERVED 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToReservedRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100);
            robotStateRepository.save(robotId, initialState);
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isTrue();

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.RESERVED, 100);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();
        }

        @DisplayName("MOVING 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToMovingRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            RobotState initialState = RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100);
            robotStateRepository.save(robotId, initialState);
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.MOVING, 90);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();
        }

        @DisplayName("WAITING_AUTH 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToWaitingAuthRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.WAITING_AUTH, 85);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();
        }

        @DisplayName("LOADING 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToLoadingRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.LOADING, 80);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();
        }

        @DisplayName("LOCKED 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToLockedRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.LOCKED, 100);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();
        }

        @DisplayName("RETURNING 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToReturningRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.RETURNING, 70);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();
        }

        @DisplayName("OFFLINE 상태로 업데이트하면 가용 로봇 큐에서 제거된다")
        @Test
        void updateToOfflineRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // when
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.OFFLINE, 100);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();
        }

        @DisplayName("큐에 없는 로봇을 비가용 상태로 업데이트해도 예외가 발생하지 않는다")
        @Test
        void updateToNonAvailableStatusWhenNotInQueue() {
            // given
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.OFFLINE, 100));

            // when & then (예외 없이 정상 실행)
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.MOVING, 90);
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();
        }

        @DisplayName("여러 로봇을 IDLE로 업데이트하면 모두 가용 큐에 추가된다")
        @Test
        void updateMultipleRobotsToIdle() {
            // given
            Long robotId1 = 1L;
            Long robotId2 = 2L;
            Long robotId3 = 3L;

            robotStateRepository.save(robotId1, RobotState.of("AA:BB:CC:01", RobotStatus.OFFLINE, 100));
            robotStateRepository.save(robotId2, RobotState.of("AA:BB:CC:02", RobotStatus.OFFLINE, 95));
            robotStateRepository.save(robotId3, RobotState.of("AA:BB:CC:03", RobotStatus.OFFLINE, 90));

            // when
            robotAvailableQueueRepository.updateState(robotId1, RobotStatus.IDLE, 100);
            robotAvailableQueueRepository.updateState(robotId2, RobotStatus.IDLE, 95);
            robotAvailableQueueRepository.updateState(robotId3, RobotStatus.IDLE, 90);

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId1)).isTrue();
            assertThat(robotAvailableQueueRepository.existsById(robotId2)).isTrue();
            assertThat(robotAvailableQueueRepository.existsById(robotId3)).isTrue();
        }
    }

    @Nested
    @DisplayName("로봇 할당")
    class AssignTest {

        @DisplayName("할당된 로봇의 상태가 RESERVED로 변경된다")
        @Test
        void assignChangesStatusToReserved() {
            // given
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // when
            Optional<Long> assignedRobotId = robotAvailableQueueRepository.acquireRobotId();

            // then
            assertThat(assignedRobotId).isPresent();
            assertThat(assignedRobotId.get()).isEqualTo(robotId);

            Optional<RobotState> state = robotStateRepository.findById(robotId);
            assertThat(state).isPresent();
            assertThat(state.get().getStatus()).isEqualTo(RobotStatus.RESERVED);
        }

        @DisplayName("할당된 로봇은 가용 큐에서 제거된다")
        @Test
        void assignRemovesFromAvailableQueue() {
            // given
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isTrue();

            // when
            robotAvailableQueueRepository.acquireRobotId();

            // then
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();
        }

        @DisplayName("가장 먼저 대기한 로봇이 먼저 할당된다 (FIFO)")
        @Test
        void assignFifoOrder() throws InterruptedException {
            // given
            Long firstRobotId = 1L;
            Long secondRobotId = 2L;
            Long thirdRobotId = 3L;

            robotStateRepository.save(firstRobotId, RobotState.of("AA:BB:CC:01", RobotStatus.OFFLINE, 100));
            robotStateRepository.save(secondRobotId, RobotState.of("AA:BB:CC:02", RobotStatus.OFFLINE, 100));
            robotStateRepository.save(thirdRobotId, RobotState.of("AA:BB:CC:03", RobotStatus.OFFLINE, 100));

            // 순서대로 IDLE 상태로 변경 (시간 간격을 두어 score 차이 발생)
            robotAvailableQueueRepository.updateState(firstRobotId, RobotStatus.IDLE, 100);
            Thread.sleep(10);
            robotAvailableQueueRepository.updateState(secondRobotId, RobotStatus.IDLE, 100);
            Thread.sleep(10);
            robotAvailableQueueRepository.updateState(thirdRobotId, RobotStatus.IDLE, 100);

            // when & then
            Optional<Long> first = robotAvailableQueueRepository.acquireRobotId();
            assertThat(first).contains(firstRobotId);

            Optional<Long> second = robotAvailableQueueRepository.acquireRobotId();
            assertThat(second).contains(secondRobotId);

            Optional<Long> third = robotAvailableQueueRepository.acquireRobotId();
            assertThat(third).contains(thirdRobotId);

            Optional<Long> fourth = robotAvailableQueueRepository.acquireRobotId();
            assertThat(fourth).isEmpty();
        }

        @DisplayName("빈 대기열에서 할당 시도 시 타임아웃 후 빈 Optional을 반환한다")
        @Test
        void assignEmptyQueueTimeout() {
            // given (빈 대기열)
            long startTime = System.currentTimeMillis();

            // when - 1초 타임아웃으로 시도
            Optional<Long> result = robotAvailableQueueRepository.acquireRobotId(1, TimeUnit.SECONDS);
            long elapsedTime = System.currentTimeMillis() - startTime;

            // then - 빈 Optional 반환 및 약 1초 경과
            assertThat(result).isEmpty();
            assertThat(elapsedTime).isGreaterThanOrEqualTo(1000L);
            assertThat(elapsedTime).isLessThan(1500L); // 여유있게 1.5초 이내
        }

        @DisplayName("할당 후 battery 값은 유지된다")
        @Test
        void assignPreservesBattery() {
            // given
            Long robotId = 1L;
            int initialBattery = 85;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, initialBattery));
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, initialBattery);

            // when
            robotAvailableQueueRepository.acquireRobotId();

            // then
            Optional<RobotState> state = robotStateRepository.findById(robotId);
            assertThat(state).isPresent();
            assertThat(state.get().getBattery()).isEqualTo(initialBattery);
        }

        @DisplayName("BRPOP: 로봇이 나중에 추가되면 blocking 대기 후 할당받는다")
        @Test
        void assignBlockingUntilRobotAvailable() throws Exception {
            // given
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.OFFLINE, 100));

            // when - 별도 스레드에서 할당 시도 (blocking)
            ExecutorService executorService = Executors.newSingleThreadExecutor();
            Future<Optional<Long>> future = executorService.submit(() ->
                    robotAvailableQueueRepository.acquireRobotId(5, TimeUnit.SECONDS)
            );

            // 할당 요청이 blocking 상태로 대기 중임을 확인하기 위한 짧은 대기
            Thread.sleep(500);
            assertThat(future.isDone()).isFalse();

            // when - 로봇을 IDLE 상태로 추가 (큐에 추가됨)
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // then - blocking이 해제되고 로봇이 할당됨
            Optional<Long> result = future.get(3, TimeUnit.SECONDS);
            assertThat(result).isPresent();
            assertThat(result.get()).isEqualTo(robotId);

            // 상태가 RESERVED로 변경됨
            Optional<RobotState> state = robotStateRepository.findById(robotId);
            assertThat(state).isPresent();
            assertThat(state.get().getStatus()).isEqualTo(RobotStatus.RESERVED);

            executorService.shutdown();
        }

        @DisplayName("BRPOP: 여러 스레드가 대기 중일 때 로봇이 추가되면 순서대로 할당받는다")
        @Test
        void assignBlockingMultipleThreads() throws InterruptedException {
            // given - 3개의 스레드가 동시에 할당 대기
            int threadCount = 3;
            ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
            CountDownLatch startLatch = new CountDownLatch(threadCount);
            CountDownLatch completeLatch = new CountDownLatch(threadCount);
            AtomicInteger successCount = new AtomicInteger(0);

            for (int i = 0; i < threadCount; i++) {
                executorService.execute(() -> {
                    startLatch.countDown();
                    try {
                        startLatch.await(); // 모든 스레드가 동시에 시작하도록 대기
                        Optional<Long> assigned = robotAvailableQueueRepository.acquireRobotId(5, TimeUnit.SECONDS);
                        if (assigned.isPresent()) {
                            successCount.incrementAndGet();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } finally {
                        completeLatch.countDown();
                    }
                });
            }

            // 모든 스레드가 blocking 대기 중임을 확인
            Thread.sleep(500);

            // when - 3대의 로봇을 순차적으로 추가
            for (int i = 1; i <= threadCount; i++) {
                Long robotId = (long) i;
                robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:0" + i, RobotStatus.IDLE, 100));
                robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);
                Thread.sleep(100); // 약간의 지연
            }

            // then - 모든 스레드가 로봇을 할당받음
            completeLatch.await(10, TimeUnit.SECONDS);
            assertThat(successCount.get()).isEqualTo(threadCount);

            executorService.shutdown();
        }
    }

    @Nested
    @DisplayName("가용 로봇 존재 여부 확인")
    class ExistsByIdTest {

        @DisplayName("로봇이 대기열에 있는지 확인할 수 있다")
        @Test
        void existsById() {
            // given
            Long availableRobotId = 1L;
            Long notAvailableRobotId = 2L;

            robotStateRepository.save(availableRobotId, RobotState.of("AA:BB:CC:01", RobotStatus.IDLE, 100));
            robotStateRepository.save(notAvailableRobotId, RobotState.of("AA:BB:CC:02", RobotStatus.MOVING, 100));

            robotAvailableQueueRepository.updateState(availableRobotId, RobotStatus.IDLE, 100);
            robotAvailableQueueRepository.updateState(notAvailableRobotId, RobotStatus.MOVING, 100);

            // when & then
            assertThat(robotAvailableQueueRepository.existsById(availableRobotId)).isTrue();
            assertThat(robotAvailableQueueRepository.existsById(notAvailableRobotId)).isFalse();
        }

        @DisplayName("존재하지 않는 로봇 ID로 가용 여부 확인 시 false를 반환한다")
        @Test
        void existsByIdNotExist() {
            // given
            Long notExistRobotId = 999L;

            // when & then
            assertThat(robotAvailableQueueRepository.existsById(notExistRobotId)).isFalse();
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

            robotMacMappingRepository.save(macAddress, robotId);
            robotStateRepository.save(robotId, RobotState.of(macAddress, RobotStatus.OFFLINE, 100));

            // when - 로봇이 IDLE 상태로 전환
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // then - 가용 큐에 추가됨
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isTrue();

            // when - 로봇 할당
            Optional<Long> assignedId = robotAvailableQueueRepository.acquireRobotId();

            // then - 할당 성공 및 상태 RESERVED
            assertThat(assignedId).contains(robotId);
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();

            Optional<RobotState> state = robotStateRepository.findById(robotId);
            assertThat(state).isPresent();
            assertThat(state.get().getStatus()).isEqualTo(RobotStatus.RESERVED);
        }

        @DisplayName("미션 완료 후 복귀하여 다시 가용 상태가 된다")
        @Test
        void robotReturnAfterMission() {
            // given - 로봇이 미션 수행 중
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.MOVING, 80));

            // when - 미션 완료 후 복귀 중
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.RETURNING, 70);
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();

            // when - 스테이션 복귀 완료
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.RETURNED, 65);

            // then - 다시 가용 상태
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isTrue();

            Optional<RobotState> state = robotStateRepository.findById(robotId);
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

            robotStateRepository.save(robot1, RobotState.of("AA:BB:CC:01", RobotStatus.OFFLINE, 100));
            robotStateRepository.save(robot2, RobotState.of("AA:BB:CC:02", RobotStatus.OFFLINE, 95));
            robotStateRepository.save(robot3, RobotState.of("AA:BB:CC:03", RobotStatus.OFFLINE, 90));

            robotAvailableQueueRepository.updateState(robot1, RobotStatus.IDLE, 100);
            Thread.sleep(5);
            robotAvailableQueueRepository.updateState(robot2, RobotStatus.IDLE, 95);
            Thread.sleep(5);
            robotAvailableQueueRepository.updateState(robot3, RobotStatus.IDLE, 90);

            // when - 첫 번째 로봇 할당
            Optional<Long> assigned1 = robotAvailableQueueRepository.acquireRobotId();
            assertThat(assigned1).contains(robot1);

            // when - 첫 번째 로봇이 복귀하여 다시 가용 상태
            robotAvailableQueueRepository.updateState(robot1, RobotStatus.RETURNED, 85);

            // when - 두 번째 로봇 할당 (robot2가 먼저 대기했으므로)
            Optional<Long> assigned2 = robotAvailableQueueRepository.acquireRobotId();
            assertThat(assigned2).contains(robot2);

            // when - 세 번째 로봇 할당
            Optional<Long> assigned3 = robotAvailableQueueRepository.acquireRobotId();
            assertThat(assigned3).contains(robot3);

            // when - 네 번째 할당 시도 (robot1이 복귀했으므로 할당 가능)
            Optional<Long> assigned4 = robotAvailableQueueRepository.acquireRobotId();
            assertThat(assigned4).contains(robot1);
        }

        @DisplayName("비상 정지(LOCKED) 후 해제되면 다시 가용 상태가 된다")
        @Test
        void emergencyStopAndResume() {
            // given - 가용 상태의 로봇
            Long robotId = 1L;
            robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:DD", RobotStatus.IDLE, 100));
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isTrue();

            // when - 비상 정지
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.LOCKED, 100);

            // then - 가용 큐에서 제거
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isFalse();

            // when - 비상 정지 해제 후 IDLE로 복귀
            robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);

            // then - 다시 가용 상태
            assertThat(robotAvailableQueueRepository.existsById(robotId)).isTrue();
        }
    }

    @Nested
    @DisplayName("동시성 테스트")
    class ConcurrencyTest {

        @DisplayName("동시에 여러 요청이 로봇을 할당받아도 각각 다른 로봇이 할당된다")
        @Test
        void concurrentAssign() throws InterruptedException {
            // given - 5대의 로봇을 가용 상태로 등록
            int robotCount = 5;
            for (int i = 1; i <= robotCount; i++) {
                Long robotId = (long) i;
                robotStateRepository.save(robotId, RobotState.of("AA:BB:CC:0" + i, RobotStatus.IDLE, 100));
                robotAvailableQueueRepository.updateState(robotId, RobotStatus.IDLE, 100);
                Thread.sleep(5);
            }

            // when - 10개의 스레드가 동시에 할당 요청 (타임아웃 1초)
            int threadCount = 10;
            ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
            CountDownLatch latch = new CountDownLatch(threadCount);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger failCount = new AtomicInteger(0);

            for (int i = 0; i < threadCount; i++) {
                executorService.execute(() -> {
                    try {
                        Optional<Long> assigned = robotAvailableQueueRepository.acquireRobotId(1, TimeUnit.SECONDS);
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

            // then - 5대만 할당 성공, 5개 요청은 타임아웃으로 실패
            assertThat(successCount.get()).isEqualTo(robotCount);
            assertThat(failCount.get()).isEqualTo(threadCount - robotCount);

            // 모든 로봇이 가용 큐에서 제거됨
            for (int i = 1; i <= robotCount; i++) {
                assertThat(robotAvailableQueueRepository.existsById((long) i)).isFalse();
            }
        }
    }
}
