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
import java.util.concurrent.TimeUnit;

@Repository
@Slf4j
@RequiredArgsConstructor
public class RobotAvailableQueueRepository {

    private static final String AVAILABLE_ROBOTS_QUEUE_KEY = "robot:available:queue";

    private final RedisTemplate<String, Object> redisTemplate;
    private final RobotStateRepository robotStateRepository;
    private final RedisScript<Long> updateRobotStateScript;
    private final RedisScript<Long> assignRobotScript;

    // 상태 (로봇) 업데이트 메서드
    public void updateState(Long robotId, RobotStatus status, Integer battery) {

        try {
            List<String> keys = List.of(
                    robotStateRepository.getKey(robotId),
                    AVAILABLE_ROBOTS_QUEUE_KEY
            );
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
        return acquireRobotId(30, TimeUnit.SECONDS);
    }

    public Optional<Long> acquireRobotId(long timeout, TimeUnit timeUnit) {
        try {
            log.debug("가용 로봇 대기 중... (timeout: {} {})", timeout, timeUnit);

            // BRPOP: blocking right pop - 로봇이 큐에 들어올 때까지 대기
            Object result = redisTemplate.opsForList().rightPop(AVAILABLE_ROBOTS_QUEUE_KEY, timeout, timeUnit);

            if (result == null) {
                log.warn("가용 로봇 할당 타임아웃 (timeout: {} {})", timeout, timeUnit);
                return Optional.empty();
            }

            Long robotId = Long.valueOf(result.toString());

            // 로봇 상태를 RESERVED로 변경
            List<String> keys = List.of(
                    robotStateRepository.getKey(robotId)
            );
            redisTemplate.execute(
                    assignRobotScript,
                    keys,
                    robotId,
                    LocalDateTime.now().toString()
            );

            log.info("로봇 할당 성공: robotId={} (RESERVED)", robotId);
            return Optional.of(robotId);
        } catch (Exception e) {
            log.error("가용로봇 할당 실패", e);
            throw e;
        }
    }

    public boolean existsById(Long robotId) {
        // List에서 robotId의 위치를 찾아서 존재 여부 확인
        List<Object> range = redisTemplate.opsForList().range(AVAILABLE_ROBOTS_QUEUE_KEY, 0, -1);
        if (range == null) {
            return false;
        }
        return range.stream()
                .anyMatch(obj -> obj != null && Long.valueOf(obj.toString()).equals(robotId));
    }
}
