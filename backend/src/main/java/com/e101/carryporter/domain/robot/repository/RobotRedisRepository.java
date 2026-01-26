package com.e101.carryporter.domain.robot.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RobotRedisRepository {

    private static final String MAC_TO_PK_PREFIX = "robot:mac:";
    private static final String ROBOT_STATUS_PREFIX = "robot:status:";
    private static final String AVAILABLE_ROBOTS_KEY= "robot:available";

    private final RedisTemplate<String, Object> redisTemplate;

    // mac - pk 저장소에 mac 과 pk 매핑 정보 저장 method
    public void saveMacMapping(String macAddress, Long robotId) {
        redisTemplate.opsForValue().set(getMacKey(macAddress), robotId);
    }

    // mac 주소 기반 robot pk 조회 메서드
    public Optional<Long> getRobotIdByMacAddress(String macAddress) {
        return Optional.ofNullable(redisTemplate.opsForValue().get(getMacKey(macAddress)))
                .map(v -> Long.valueOf(v.toString()));
    }

    // mac 주소 기반 매핑 정보 삭제 메서드
    public void deleteMacMapping(String macAddress) {
        redisTemplate.delete(getMacKey(macAddress));
    }

    private String getMacKey(String macAddress) {
        return MAC_TO_PK_PREFIX + macAddress;
    }

    private String getRobotStatusKey(Long robotId) {
        return ROBOT_STATUS_PREFIX + robotId;
    }

}
