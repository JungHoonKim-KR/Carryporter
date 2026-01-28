package com.e101.carryporter.global.config.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;

@Configuration
public class RobotRedisScriptConfig {

    @Bean
    public RedisScript<Long> updateRobotStateScript() {
        String script = """

                local hashKey = KEYS[1]
                local queueKey = KEYS[2]

                local robotId = ARGV[1]
                local status = ARGV[2]
                local battery = ARGV[3]
                local updatedAt = ARGV[4]

                redis.call('HSET', hashKey,
                    'status', status,
                    'battery', battery,
                    'updatedAt', updatedAt
                )

                if status == '"IDLE"' or status == '"RETURNED"' then
                    -- List에 추가 (중복 방지를 위해 먼저 제거 후 추가)
                    redis.call('LREM', queueKey, 0, robotId)
                    redis.call('LPUSH', queueKey, robotId)
                else
                    redis.call('LREM', queueKey, 0, robotId)
                end

                return 1
                """;

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(script);
        redisScript.setResultType(Long.class);

        return redisScript;
    }

    @Bean
    public RedisScript<Long> assignRobotScript() {
        String script = """
            local hashKey = KEYS[1]

            local robotId = ARGV[1]
            local timestamp = ARGV[2]

            -- 상태를 RESERVED로 변경
            redis.call('HSET', hashKey,
                'status', '"RESERVED"',
                'updatedAt', timestamp
            )

            return 1
            """;

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(script);
        redisScript.setResultType(Long.class);

        return redisScript;
    }
}
