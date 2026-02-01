package com.e101.carryporter.global.config.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;

@Configuration
public class RobotRedisScriptConfig {

    @Bean("updateRobotStateScript")
    public RedisScript<Long> updateRobotStateScript() {
        String script = """
                -- [KEYS]
                local hashKey = KEYS[1]      -- robot:status:{id}
                local queueKey = KEYS[2]     -- robot:available (List)
                
                -- [ARGV]
                local robotId = ARGV[1]
                local status = ARGV[2]
                local battery = ARGV[3]      -- null 가능
                local updatedAt = ARGV[4]

                -- 1. 해시(Hash) 정보 업데이트 (Status, UpdatedAt은 필수)
                redis.call('HSET', hashKey, 'status', status, 'updatedAt', updatedAt)

                -- 2. 배터리 부분 업데이트 (Partial Update)
                -- Java에서 null을 보내면 문자열 'null'로 오거나 빈 값일 수 있어서 체크
                if battery ~= nil and battery ~= 'null' and battery ~= '' then
                    redis.call('HSET', hashKey, 'battery', battery)
                end

                -- 3. 대기열(List) 관리 로직
                -- (핵심) 일단 큐에서 무조건 지웁니다 (중복 방지 & 상태 변경 시 제거 목적)
                -- LREM key count value: count가 0이면 일치하는 모든 요소 제거
                redis.call('LREM', queueKey, 0, robotId)

                -- (핵심) 가용 상태(IDLE, IDLE)가 되면 큐의 맨 뒤(Right)에 줄을 세웁니다.
                if status == 'IDLE' or status == 'IDLE' then
                    redis.call('RPUSH', queueKey, robotId)
                end
                
                -- BUSY, WORKING 등 다른 상태라면?
                -- 위에서 LREM으로 이미 지워졌으므로 아무것도 안 하면 됨 (큐에서 사라짐)

                return 1
                """;

        // 반환 타입 Long (성공 시 1)
        return new DefaultRedisScript<>(script, Long.class);
    }
}
