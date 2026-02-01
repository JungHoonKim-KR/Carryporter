package com.e101.carryporter.domain.robot.repository;

import com.e101.carryporter.domain.robot.entity.RobotState;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Slf4j
public class RobotStateRepository {

    private static final String ROBOT_STATUS_PREFIX = "robot:status:";
    private static final String AVAILABLE_ROBOTS_KEY = "robot:available";

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final RedisScript<Long> updateRobotScript;

    public RobotStateRepository(
            RedisTemplate<String, Object> redisTemplate,
            ObjectMapper objectMapper,
            @Qualifier("updateRobotStateScript") RedisScript<Long> updateRobotScript
    ) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.updateRobotScript = updateRobotScript;
    }

    public void save(Long robotId, RobotState robotState) {
        String key = getKey(robotId);

        try {
            Map<String, Object> stateMap = objectMapper.convertValue(robotState, new TypeReference<Map<String, Object>>() {
            });
            redisTemplate.opsForHash().putAll(key, stateMap);
            log.debug("로봇 상태 저장: robotId={}", robotId);
        } catch (Exception e) {
            log.error("로봇 상태 저장 실패: robotId={}, 예외={}", robotId, e.getMessage(), e);
            throw e;
        }
    }

    public Optional<RobotState> findById(Long robotId) {
        String key = getKey(robotId);

        try {
            Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);

            if (entries.isEmpty()) {
                return Optional.empty();
            }

            return Optional.of(objectMapper.convertValue(entries, RobotState.class));
        } catch (Exception e) {
            log.error("로봇 상태 조회 실패: robotId={}, 이유: {}", robotId, e.getMessage(), e);
            return Optional.empty();
        }
    }

    public void updateStatusOnly(Long robotId, RobotStatus newStatus) {
        String robotKey = ROBOT_STATUS_PREFIX + robotId;

        try {
            List<String> keys = List.of(robotKey, AVAILABLE_ROBOTS_KEY);

            redisTemplate.execute(
                    updateRobotScript,
                    keys,
                    robotId,
                    newStatus.name(),
                    null,
                    LocalDateTime.now().toString());

            log.debug("Redis 상태 동기화 완료: robotId={}, status={}", robotId, newStatus);
        } catch (Exception e) {
            log.error("Redis 상태 업데이트 중 에러 발생: robotId={}, status={}", robotId, newStatus, e);
            throw new RuntimeException("Redis update failed", e);
        }
    }

    public String getKey(Long robotId) {
        return ROBOT_STATUS_PREFIX + robotId;
    }
}
