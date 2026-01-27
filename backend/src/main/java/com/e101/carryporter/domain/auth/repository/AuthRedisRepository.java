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
public class AuthRedisRepository {

    private static final String USER_PWD_PREFIX = "user:password:";
    private static final String EMAIL_CODE_PREFIX = "auth:email:code:";
    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final String LOGIN_FAIL_PREFIX = "auth:fail:count:";

    private final RedisTemplate<String, Object> redisTemplate;

    // 사용자 4자리 비밀번호 저장 메서드 (TTL: 24 hour)
    public void saveUserPassword(Long userId, Integer password) {
        redisTemplate.opsForValue().set(getUserPasswordKey(userId), password, 24, TimeUnit.HOURS);
    }

    // 사용자 4자리 비밀번호 조회 메서드
    public Optional<Integer> getUserPassword(Long userId) {
        try {
            Object value = redisTemplate.opsForValue().get(getUserPasswordKey(userId));

            if (value == null) {
                return Optional.empty();
            }

            return Optional.of(Integer.valueOf(value.toString()));
        } catch (Exception e) {
            log.error("4자리 비밀번호 조회 실패 : userId = {}" ,userId, e);
            return Optional.empty();
        }
    }

    // 사용자 4자리 비밀번호 삭제 메서드
    public void deleteUserPassword(Long userId) {
        try {
            redisTemplate.delete(getUserPasswordKey(userId));
        } catch (Exception e) {
            log.error("비밀번호 삭제 실패 : userId = {}" ,userId, e);
        }
    }

    public void saveEmailCode(String mmEmail, Integer code) {
        try {
            redisTemplate.opsForValue().set(getEmailCodeKey(mmEmail), code, 5, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.error("인증번호 저장 실패 : mmEmail = {}" , mmEmail, e);
        }
    }

    public Optional<Integer> getEmailCode(String mmEmail, Integer code) {
        try {
            Object value = redisTemplate.opsForValue().get(getEmailCodeKey(mmEmail));

            if (value == null) {
                return Optional.empty();
            }

            return Optional.of(Integer.valueOf(value.toString()));

        } catch (Exception e) {
            log.error("인증번호 조회 실패 : mmEmail = {}" , mmEmail, e);
            return Optional.empty();
        }
    }

    public void deleteEmailCode(String mmEmail) {
        try {
            redisTemplate.delete(getEmailCodeKey(mmEmail));
        } catch (Exception e) {
            log.error("인증번호 삭제 실패 : mmEmail = {}" , mmEmail, e);
        }
    }

    public void saveRefreshToken(Long userId, String refreshToken) {
        try {
            redisTemplate.opsForValue().set(getRefreshTokenKey(userId), refreshToken, 7, TimeUnit.DAYS);
        } catch (Exception e) {
            log.error("refresh token 저장 실패 : userId = {}" , userId, e);
        }
    }

    public Optional<String> getRefreshToken(Long userId) {
        try {
            Object value = redisTemplate.opsForValue().get(getRefreshTokenKey(userId));

            if (value == null) {
                return Optional.empty();
            }

            return Optional.of(value.toString());
        } catch (Exception e) {
            log.error("refresh token 조회 실패 : userId = {}" , userId, e);
            return Optional.empty();
        }
    }

    public void deleteRefreshToken(Long userId) {
        try {
          redisTemplate.delete(getRefreshTokenKey(userId));
        } catch (Exception e) {
            log.error("refresh token 삭제 실패 : userId = {}" , userId, e);
        }
    }

    public void incrementFailCount(Long userId) {
        String key = getLoginFailKey(userId);

        Long count = redisTemplate.opsForValue().increment(key);

        // 처음 실패해서 숫자가 1이 된 그 순간에만 만료 시간(1시간) 설정
        if (count != null && count == 1) {
            redisTemplate.expire(key, 1, TimeUnit.HOURS);
        }
    }

    /** todo 집가서 */
    public Optional<Integer> getFailCount(Long userId) {
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

    public void resetFailCount(Long userId) {

    }

    private String getUserPasswordKey(Long userId) {
        return USER_PWD_PREFIX + userId;
    }

    private String getEmailCodeKey(String mmEmail) {
        return EMAIL_CODE_PREFIX + mmEmail;
    }

    private String getRefreshTokenKey(Long userId) {
        return REFRESH_TOKEN_PREFIX + userId;
    }

    private String getLoginFailKey(Long userId) {
        return LOGIN_FAIL_PREFIX + userId;
    }
}
