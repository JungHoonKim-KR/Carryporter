package com.e101.carryporter.domain.robot.repository;

import com.e101.carryporter.domain.robot.entity.RobotStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
@Slf4j
@RequiredArgsConstructor
public class RobotAvailableQueueRepository {

    private static final String AVAILABLE_ROBOTS_KEY = "robot:available";

    private final RedisTemplate<String, Object> redisTemplate;
    private final RobotStateRepository robotStateRepository;
    private final RedisScript<Long> updateRobotStateScript;
    private final RedisScript<Long> assignRobotScript;

    // 상태 (로봇) 업데이트 메서드
    public void updateState(Long robotId, RobotStatus status, Integer battery) {

        try {
            List<String> keys = List.of(robotStateRepository.getKey(robotId), AVAILABLE_ROBOTS_KEY);
            Long result = redisTemplate.execute(
                    updateRobotStateScript,
                    keys,
                    robotId,
                    status.name(),
                    battery,
                    LocalDateTime.now().toString()
            );

            log.debug("로봇 상태 업데이트: robotId={}, status={}, battery={}, result={}",
                    robotId, status, battery, result);
        } catch (Exception e) {
            log.error("로봇 상태 업데이트 실패: robotId={}, status={}, battery={}",
                    robotId, status, battery, e);
            throw e;
        }
    }

    public Optional<Long> acquireRobotId() {
        try {
            Long robotId = redisTemplate.execute(
                    assignRobotScript,
                    List.of(AVAILABLE_ROBOTS_KEY),
                    LocalDateTime.now().toString()
            );

            if (robotId != null) {
                log.info("로봇 할당 성공: robotId={} (RESERVED)", robotId);
            } else {
                log.warn("가용 로봇 없음");
            }

            return Optional.ofNullable(robotId);
        } catch (Exception e) {
            log.error("가용로봇 할당 실패", e);
            throw e;
        }
    }

    public boolean existsById(Long robotId) {
        return redisTemplate.opsForZSet().score(AVAILABLE_ROBOTS_KEY, robotId) != null;
    }
}
