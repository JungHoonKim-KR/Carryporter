package com.carryporter.carryporter.support;

import com.redis.testcontainers.RedisContainer;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.utility.DockerImageName;

@ActiveProfiles("test")
@SpringBootTest
@Transactional
@RecordApplicationEvents
public abstract class IntegrationTestSupport {

    @Autowired
    protected ApplicationEvents events;

    private final static int MOSQUITTO_PORT = 1883;

    // MySQL Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");


    // Redis Container
    @ServiceConnection
    static RedisContainer redis = new RedisContainer(DockerImageName.parse("redis:7.0"));

    // MQTT Container
    static GenericContainer<?> mosquitto =  new GenericContainer<>(DockerImageName.parse("eclipse-mosquitto:2.0"))
            .withExposedPorts(MOSQUITTO_PORT);

    static {
        mysql.start();
        redis.start();
        mosquitto.start();
    }

    @DynamicPropertySource
    static void mqttProperties(DynamicPropertyRegistry registry) {
        String host = mosquitto.getHost();
        Integer port =  mosquitto.getMappedPort(MOSQUITTO_PORT);
        registry.add("MQTT_HOST", () -> host);
        registry.add("MQTT_PORT", () -> port);
    }

}
