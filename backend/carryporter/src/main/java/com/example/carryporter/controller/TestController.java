package com.example.carryporter.controller;

import com.example.carryporter.entity.TestMessage;
import com.example.carryporter.repository.TestMessageRepository;
import com.example.carryporter.service.MqttService;
import com.example.carryporter.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    private final TestMessageRepository testMessageRepository;
    private final RedisService redisService;
    private final MqttService mqttService;

    /**
     * 전체 연결 테스트
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> result = new HashMap<>();

        // MySQL 테스트
        try {
            long count = testMessageRepository.count();
            result.put("mysql", "OK (count: " + count + ")");
        } catch (Exception e) {
            result.put("mysql", "FAIL: " + e.getMessage());
        }

        // Redis 테스트
        try {
            redisService.set("health-check", "ok");
            String value = redisService.get("health-check");
            result.put("redis", "OK (value: " + value + ")");
            redisService.delete("health-check");
        } catch (Exception e) {
            result.put("redis", "FAIL: " + e.getMessage());
        }

        // MQTT 테스트
        try {
            mqttService.publish("test/health", "health-check");
            result.put("mqtt", "OK (published)");
        } catch (Exception e) {
            result.put("mqtt", "FAIL: " + e.getMessage());
        }

        return ResponseEntity.ok(result);
    }

    /**
     * MySQL 테스트 - 저장
     */
    @PostMapping("/mysql")
    public ResponseEntity<TestMessage> saveMysql(@RequestParam String content) {
        TestMessage message = new TestMessage(content);
        return ResponseEntity.ok(testMessageRepository.save(message));
    }

    /**
     * MySQL 테스트 - 조회
     */
    @GetMapping("/mysql")
    public ResponseEntity<?> getMysql() {
        return ResponseEntity.ok(testMessageRepository.findAll());
    }

    /**
     * Redis 테스트 - 저장
     */
    @PostMapping("/redis")
    public ResponseEntity<Map<String, String>> saveRedis(
            @RequestParam String key,
            @RequestParam String value) {
        redisService.set(key, value);
        Map<String, String> result = new HashMap<>();
        result.put("key", key);
        result.put("value", value);
        result.put("status", "saved");
        return ResponseEntity.ok(result);
    }

    /**
     * Redis 테스트 - 조회
     */
    @GetMapping("/redis")
    public ResponseEntity<Map<String, String>> getRedis(@RequestParam String key) {
        String value = redisService.get(key);
        Map<String, String> result = new HashMap<>();
        result.put("key", key);
        result.put("value", value);
        return ResponseEntity.ok(result);
    }

    /**
     * MQTT 테스트 - 발행
     */
    @PostMapping("/mqtt")
    public ResponseEntity<Map<String, String>> publishMqtt(
            @RequestParam(defaultValue = "test/topic") String topic,
            @RequestParam String message) {
        mqttService.publish(topic, message);
        Map<String, String> result = new HashMap<>();
        result.put("topic", topic);
        result.put("message", message);
        result.put("status", "published");
        return ResponseEntity.ok(result);
    }
}
