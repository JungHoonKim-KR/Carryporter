package com.carryporter.carryporter;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = CarryporterApplication.class)
@ActiveProfiles("local")
class CarryPorterApplicationTests {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired(required = false)
    private MqttPahoClientFactory mqttClientFactory;

    @Value("${mqtt.broker.url}")
    private String mqttBrokerUrl;

    @Test
    @DisplayName("Spring Context 로드 테스트")
    void contextLoads() {
        // 컨텍스트가 정상적으로 로드되는지 확인
    }

    @Test
    @DisplayName("MySQL 연결 테스트")
    void testMysqlConnection() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            assertThat(connection.isValid(1)).isTrue();
            System.out.println("MySQL 연결 성공: " + connection.getMetaData().getURL());
        }
    }

    @Test
    @DisplayName("Redis 연결 테스트")
    void testRedisConnection() {
        String key = "test:connection";
        String value = "success";

        redisTemplate.opsForValue().set(key, value);
        String result = redisTemplate.opsForValue().get(key);

        assertThat(result).isEqualTo(value);
        redisTemplate.delete(key);
        System.out.println("Redis 연결 및 읽기/쓰기 성공");
    }

    @Test
    @DisplayName("MQTT 브로커 연결 테스트")
    void testMqttConnection() throws Exception {
        if (mqttClientFactory != null) {
            // 팩토리를 사용하여 실제 연결 시도
            IMqttClient client = mqttClientFactory.getClientInstance(mqttBrokerUrl, "test-connection-client-id");
            client.connect();

            assertThat(client.isConnected()).isTrue();

            client.disconnect();
            System.out.println("MQTT 브로커 연결 성공: " + mqttBrokerUrl);
        } else {
            System.out.println("MqttPahoClientFactory 빈을 찾을 수 없습니다. MQTT 설정을 확인하세요.");
        }
    }
}
