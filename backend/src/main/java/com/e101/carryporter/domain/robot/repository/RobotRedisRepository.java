package com.e101.carryporter.domain.robot.repository;

import com.e101.carryporter.domain.robot.entity.RobotState;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@Slf4j
@RequiredArgsConstructor
public class RobotRedisRepository {

    private static final String MAC_TO_PK_PREFIX = "robot:mac:";
    private static final String ROBOT_STATUS_PREFIX = "robot:status:";
    private static final String AVAILABLE_ROBOTS_KEY = "robot:available";

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final RedisScript<Long> updateRobotStateScript;
    private final RedisScript<Long> assignRobotScript;

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

        try {
            Map<String, Object> stateMap = objectMapper.convertValue(robotState, new TypeReference<Map<String, Object>>() {});
            redisTemplate.opsForHash().putAll(key, stateMap);
            log.debug("로봇 상태 저장: robot id = {}", robotId);
        } catch (Exception e) {
            log.error("로봇 상태 저장 실패: robot id = {}, 예외 = {}", robotId, e.getMessage(), e);
            throw e;
        }
    }

    // 로봇 상태 조회 메서드
    public Optional<RobotState> getRobotState(Long robotId) {
        String key = getRobotStateKey(robotId);

        try {
            Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);

            if (entries.isEmpty()) {
                return Optional.empty();
            }

            return Optional.of(objectMapper.convertValue(entries, RobotState.class));
        } catch (Exception e) {
            log.error("로봇 상태 조회 실패: robot id = {}, 이유: {}", robotId, e.getMessage(), e);
            return Optional.empty();
        }
    }

    // 로봇 상태 업데이트 메서드
    public void updateRobotState(Long robotId, RobotStatus status, Integer battery) {
        Long result = redisTemplate.execute(
                updateRobotStateScript,
                List.of(getRobotStateKey(robotId), AVAILABLE_ROBOTS_KEY),
                robotId,
                status.name(),
                battery,
                LocalDateTime.now().toString()
        );

        log.debug("로봇 상태 업데이트: robotId={}, status={}, battery={}, result={}",
                robotId, status, battery, result);
    }

    // 가용가능한 로봇중 가장 우선순위 높은 로봇 id 반환
    public Optional<Long> assignRobot() {
        Long robotId = redisTemplate.execute(
                assignRobotScript,
                List.of(AVAILABLE_ROBOTS_KEY),
                LocalDateTime.now().toString()
        );

        if (robotId != null) {
            log.info("로봇 할당 성공: robotId = {} (RESERVERD)", robotId);
        } else {
            log.warn("가용 로봇 없음");
        }

        return Optional.ofNullable(robotId);
    }

    // 특정 로봇이 대기열에 있는지 확인하는 메서드
    public boolean isRobotAvailable(Long robotId) {
        return redisTemplate.opsForZSet().score(AVAILABLE_ROBOTS_KEY, robotId) != null;
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
