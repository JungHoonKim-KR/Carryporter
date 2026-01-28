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
                local availableKey = KEYS[2]
                
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
                    local time = redis.call('TIME')
                    local score = time[1] * 1000000 + time[2]
                    redis.call('ZADD', availableKey, score, robotId)
                else
                    redis.call('ZREM', availableKey, robotId)
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
            local availableKey = KEYS[1]
            local timestamp = ARGV[1]
            
            -- 가장 오래 대기한 로봇 (IDLE or RETURNED)
            local result = redis.call('ZPOPMIN', availableKey, 1)
            
            if #result == 0 then
                return nil
            end
            
            local robotId = result[1]
            local hashKey = 'robot:status:' .. robotId
            
            
            -- 상태를 RESERVED로 변경
            redis.call('HSET', hashKey,
                'status', '"RESERVED"',
                'updatedAt', timestamp
            )
            
            return tonumber(robotId)
            """;

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(script);
        redisScript.setResultType(Long.class);

        return redisScript;
    }
}
