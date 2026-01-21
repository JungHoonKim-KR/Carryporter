package com.example.carryporter.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqttService {

    private final MessageChannel mqttOutboundChannel;

    public void publish(String topic, String payload) {
        Message<String> message = MessageBuilder
                .withPayload(payload)
                .setHeader(MqttHeaders.TOPIC, topic)
                .build();
        mqttOutboundChannel.send(message);
        log.info("Published to {}: {}", topic, payload);
    }

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<?> message) {
        String topic = (String) message.getHeaders().get(MqttHeaders.TOPIC);
        String payload = message.getPayload().toString();
        log.info("Received from {}: {}", topic, payload);
    }
}
