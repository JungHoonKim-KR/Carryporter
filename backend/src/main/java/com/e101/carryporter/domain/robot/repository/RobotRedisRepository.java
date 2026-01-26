package com.e101.carryporter.domain.robot.repository;

import com.e101.carryporter.domain.robot.entity.RobotState;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RobotRedisRepository {

    private static final String MAC_TO_PK_PREFIX = "robot:mac:";
    private static final String ROBOT_STATUS_PREFIX = "robot:status:";
    private static final String AVAILABLE_ROBOTS_KEY= "robot:available";

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    // mac - pk 저장소에 mac 과 pk 매핑 정보 저장 메서드
    public void saveMacMapping(String macAddress, Long robotId) {
        redisTemplate.opsForValue().set(getMacKey(macAddress), robotId);
    }

    // mac 주소 기반 robot pk 조회 메서드
    public Optional<Long> getRobotIdByMacAddress(String macAddress) {
        return Optional.ofNullable(redisTemplate.opsForValue().get(getMacKey(macAddress)))
                .map(v -> Long.valueOf(v.toString()));
    }

    // 로봇 상태 저장 메서드
    public void saveRobotState(Long robotId, RobotState robotState) {

        String key = getRobotStateKey(robotId);
        Map<String, Object> stateMap = objectMapper.convertValue(robotState, new TypeReference<Map<String, Object>>() {
        });

        redisTemplate.opsForHash().putAll(key, stateMap);
    }

    // 로봇 상태 조회 메서드
    public Optional<RobotState> getRobotState(Long robotId) {
        String key = getRobotStateKey(robotId);

        Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);

        if (entries.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(objectMapper.convertValue(entries, RobotState.class));
    }

    // 로봇 상태 업데이트 메서드
    public void updateRobotState(Long robotId, String fieldName, Object value) {
        String key = getRobotStateKey(robotId);

        redisTemplate.opsForHash().put(key, fieldName, value);
        redisTemplate.opsForHash().put(key, "updateAt", LocalDateTime.now());
    }


    // mac 주소 기반 매핑 정보 삭제 메서드
    public void deleteMacMapping(String macAddress) {
        redisTemplate.delete(getMacKey(macAddress));
    }

    private String getMacKey(String macAddress) {
        return MAC_TO_PK_PREFIX + macAddress;
    }

    private String getRobotStateKey(Long robotId) {
        return ROBOT_STATUS_PREFIX + robotId;
    }

}
