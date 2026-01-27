package com.e101.carryporter.domain.auth.repository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Repository
@Slf4j
@RequiredArgsConstructor
public class LoginFailCountRedisRepository {

    private static final String LOGIN_FAIL_PREFIX = "auth:fail:count:";
    private static final long TTL_HOURS = 1;

    private final RedisTemplate<String, Object> redisTemplate;

    // 로그인 실패 횟수 증가 메서드 (TTL 1시간)
    public void increment(Long userId) {
        String key = getLoginFailKey(userId);

        try {
            Long count = redisTemplate.opsForValue().increment(key);

            // 처음 실패해서 숫자가 1이 된 그 순간에만 만료 시간(1시간) 설정
            if (count != null && count == 1) {
                redisTemplate.expire(key, TTL_HOURS, TimeUnit.HOURS);
            }

            log.debug("로그인 실패 횟수 증가 userId = {}, count = {}", userId, count);
        } catch (Exception e) {
            log.error("사용자 인증 실패 카운트 증가 실패: userId = {}", userId, e);
            // 조용히 넘어가고 다음번에 다시 카운트 -> 로그인 시도 횟수는 보조기능 -> 예외던지면 로그인 프로세스 멈춰버림
        }
    }

    // 로그인 실패 횟수 조회 메서드
    public Optional<Integer> get(Long userId) {
        try {
            Object value = redisTemplate.opsForValue().get(getLoginFailKey(userId));

            if (value == null) {
                return Optional.empty();
            }

            return Optional.of(Integer.valueOf(value.toString()));
        } catch (Exception e) {
            log.error("실패 횟수 파싱 에러 : userId = {}", userId, e);
            return Optional.empty();
        }
    }

    // 로그인 실패 횟수 초기화 메서드
    public void reset(Long userId) {
        try {
            redisTemplate.delete(getLoginFailKey(userId));
            log.debug("로그인 실패 횟수 초기화 userId = {}", userId);
        } catch (Exception e) {
            log.error("로그인 실패 횟수 초기화 실패 : userId = {}", userId, e);
        }
    }

    private String getLoginFailKey(Long userId) {
        return LOGIN_FAIL_PREFIX + userId;
    }
}
