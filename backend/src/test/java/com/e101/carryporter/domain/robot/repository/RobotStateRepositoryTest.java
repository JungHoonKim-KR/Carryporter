package com.e101.carryporter.domain.robot.repository;

import com.e101.carryporter.domain.robot.entity.RobotState;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.e101.carryporter.support.IntegrationTestSupport;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class RobotStateRepositoryTest extends IntegrationTestSupport {

    @Autowired
    RobotStateRepository robotStateRepository;

    @Autowired
    RedisTemplate<String, Object> redisTemplate;

    @AfterEach
    void tearDown() {
        Optional.ofNullable(redisTemplate.getConnectionFactory())
                .map(RedisConnectionFactory::getConnection)
                .ifPresent(conn -> conn.serverCommands().flushDb());
    }

    @DisplayName("로봇 상태를 저장하고 조회할 수 있다")
    @Test
    void saveAndFindById() {
        // given
        Long robotId = 1L;
        String macAddress = "AA:BB:CC:DD";
        RobotState robotState = RobotState.of(macAddress, RobotStatus.IDLE, 100);

        // when
        robotStateRepository.save(robotId, robotState);
        Optional<RobotState> result = robotStateRepository.findById(robotId);

        // then
        assertThat(result).isPresent();
        RobotState savedState = result.get();
        assertThat(savedState.getMacAddress()).isEqualTo(macAddress);
        assertThat(savedState.getStatus()).isEqualTo(RobotStatus.IDLE);
        assertThat(savedState.getBattery()).isEqualTo(100);
    }

    @DisplayName("존재하지 않는 Robot ID로 상태 조회 시 빈 Optional을 반환한다")
    @Test
    void findByIdNotFound() {
        // given
        Long notExistRobotId = 999L;

        // when
        Optional<RobotState> result = robotStateRepository.findById(notExistRobotId);

        // then
        assertThat(result).isEmpty();
    }

    @DisplayName("로봇 상태만 업데이트할 수 있다")
    @Test
    void updateStatusOnly() {
        // given
        Long robotId = 1L;
        String macAddress = "AA:BB:CC:DD";
        RobotState robotState = RobotState.of(macAddress, RobotStatus.IDLE, 100);
        robotStateRepository.save(robotId, robotState);

        // when
        robotStateRepository.updateStatusOnly(robotId, RobotStatus.RESERVED);

        // then
        Optional<RobotState> result = robotStateRepository.findById(robotId);
        assertThat(result).isPresent();
        RobotState updatedState = result.get();
        assertThat(updatedState.getStatus()).isEqualTo(RobotStatus.RESERVED);
        assertThat(updatedState.getMacAddress()).isEqualTo(macAddress);
        assertThat(updatedState.getBattery()).isEqualTo(100);
    }

    @DisplayName("존재하지 않는 로봇의 상태를 업데이트하려고 해도 예외가 발생하지 않는다")
    @Test
    void updateStatusOnlyForNonExistentRobot() {
        // given
        Long notExistRobotId = 999L;

        // when & then
        robotStateRepository.updateStatusOnly(notExistRobotId, RobotStatus.IDLE);
    }
}
