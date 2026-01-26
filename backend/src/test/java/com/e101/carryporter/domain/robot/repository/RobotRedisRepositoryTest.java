package com.e101.carryporter.domain.robot.repository;

import com.e101.carryporter.support.IntegrationTestSupport;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class RobotRedisRepositoryTest extends IntegrationTestSupport {

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

    @DisplayName("mac 주소 와 robot id 를 mapping 해서 저장할 수 있다.")
    @Test
    void macMapping() {

        // given
        String macAddress = "AA:BB:CC:DD";
        Long robotId = 1L;

        robotRedisRepository.saveMacMapping(macAddress, robotId);

        // when
        Optional<Long> robotIdOpt = robotRedisRepository.getRobotIdByMacAddress(macAddress);

        // then
        assertThat(robotIdOpt).isPresent();
        assertThat(robotIdOpt.get()).isEqualTo(robotId);
    }

    @DisplayName("같은 mac 주소에 여러 pk 를 저장할 경우 마지막 값이 저장된다.")
    @Test
    void duplicatedMac() {

        // given
        String macAddress = "AA:BB:CC:DD";
        Long firstId = 1L;
        Long secondId = 2L;

        robotRedisRepository.saveMacMapping(macAddress, firstId);
        robotRedisRepository.saveMacMapping(macAddress, secondId);

        // when
        Optional<Long> robotIdOpt = robotRedisRepository.getRobotIdByMacAddress(macAddress);

        // then
        assertThat(robotIdOpt).isPresent();
        assertThat(robotIdOpt.get()).isEqualTo(secondId);
    }

    @DisplayName("없는 mac 주소로 id 조회시 빈 optional을 반환한다.")
    @Test
    void notExistMacAddress() {

        // given
        String notExistMacAddress = "AA:BB:CC:DD";

        // when
        Optional<Long> robotIdOpt = robotRedisRepository.getRobotIdByMacAddress(notExistMacAddress);

        // then
        assertThat(robotIdOpt).isEmpty();
    }

    @DisplayName("mac 주소 기반으로 pk 를 삭제할 수 있다")
    @Test
    void deleteMacMapping() {

        // given
        String macAddress = "AA:BB:CC:DD";
        Long robotId = 1L;

        robotRedisRepository.saveMacMapping(macAddress, robotId);
        robotRedisRepository.deleteMacMapping(macAddress);

        // when
        Optional<Long> robotIdOpt = robotRedisRepository.getRobotIdByMacAddress(macAddress);

        // then
        assertThat(robotIdOpt).isEmpty();
    }

    @DisplayName("없는 mac 주소 기반으로 삭제 시도시 아무일도 일어나지 않는다.")
    @Test
    void deleteMacMappingWithNotExistMac() {
        // given
        String macAddress = "AA:BB:CC:DD";

        // when then
        robotRedisRepository.deleteMacMapping(macAddress);
    }

}