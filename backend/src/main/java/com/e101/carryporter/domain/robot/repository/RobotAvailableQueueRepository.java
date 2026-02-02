package com.e101.carryporter.domain.robot.repository;

import com.e101.carryporter.domain.robot.entity.RobotStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
@Slf4j
@RequiredArgsConstructor
public class RobotAvailableQueueRepository {

    private static final String AVAILABLE_ROBOTS_KEY = "robot:available";
    private static final int TIME_OUT_SEC = 20;

    private final RedisTemplate<String, Object> redisTemplate;
    private final RobotStateRepository robotStateRepository;

    public Optional<Long> acquireRobotId() {

        Object result = null;

        try {
            log.debug("로봇 배정 대기 중 ... ");

            // 최대 20초간 blocking
            result = redisTemplate.opsForList()
                    .leftPop(AVAILABLE_ROBOTS_KEY, TIME_OUT_SEC, TimeUnit.SECONDS);

            if (result == null) {
                return Optional.empty();
            }

            Long robotId = Long.valueOf(result.toString());
            robotStateRepository.updateStatusOnly(robotId, RobotStatus.BUSY);

            return Optional.of(robotId);

        } catch (Exception e) {
            log.error("로봇 배정 에러 발생!!", e);
            if (result != null) {
                log.error("로봇 대기 큐에 복구 시도");
                try {
                    Long robotId = Long.valueOf(result.toString());
                    returnRobotToQueue(robotId);
                } catch (Exception ex) {
                    log.error("복구 실패...");
                }
            }
            throw e;
        }
    }

    public void returnRobotToQueue(Long robotId) {
        robotStateRepository.updateStatusOnly(robotId, RobotStatus.IDLE);
    }
}
