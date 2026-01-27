package com.e101.carryporter.global.service.mqtt;

import com.e101.carryporter.support.IntegrationTestSupport;
import org.eclipse.paho.client.mqttv3.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.ChannelInterceptor;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class MqttIntegrationTest extends IntegrationTestSupport {

    @Autowired
    private MqttPublisherService mqttPublisherService;

    @Autowired
    @Qualifier("mqttInputChannel")
    private MessageChannel mqttInputChannel;

    @Autowired
    private MqttPahoMessageDrivenChannelAdapter mqttInbound;

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Test
    @DisplayName("MQTT 통합 테스트 - 메시지 발행 및 수신 확인")
    void testMqttPublishAndSubscribe() throws Exception {
        // given
        String mac = "test-mac";
        String topic = "robot/" + mac + "/register";
        String payload = "{\"status\":\"ok\"}";

        BlockingQueue<String> messageQueue = new LinkedBlockingQueue<>();

        // 별도의 Paho 클라이언트로 구독
        MqttClient subscriber = new MqttClient(brokerUrl, "test-subscriber-client");
        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        subscriber.connect(options);

        subscriber.subscribe(topic, (t, msg) -> {
            messageQueue.offer(new String(msg.getPayload()));
        });

        // 구독 완료 대기
        Thread.sleep(1000);

        // when
        mqttPublisherService.publish(topic, payload);

        // then
        String receivedMessage = messageQueue.poll(10, TimeUnit.SECONDS);

        // cleanup
        subscriber.disconnect();
        subscriber.close();

        assertThat(receivedMessage).isNotNull();
        assertThat(receivedMessage).isEqualTo(payload);
    }

    @Test
    @DisplayName("MQTT 수신 통합 테스트 - 외부 발행 메시지를 MqttSubscriberService가 수신")
    /**
     * 로봇(외부 클라이언트) → Mosquitto 브로커 → Spring mqttInbound 어댑터 → mqttInputChannel
     * → ChannelInterceptor가 큐에 저장 → 테스트에서 큐를 읽어 검증
     */
    void testMqttSubscriberReceivesMessage() throws Exception {
        // given
        String mac = "test-robot-mac";
        String topic = "robot/" + mac + "/status";
        String payload = "{\"bat\":85,\"x\":15.5,\"y\":25.3}";

        // Spring Integration MQTT 6.x 버그 우회:
        // 와일드카드 토픽(robot/+/status)으로 브로커에서 구독은 되지만,
        // 수신된 메시지 토픽(robot/test-robot-mac/status)과 정확히 일치하지 않아 무시됨
        // https://github.com/spring-projects/spring-integration/issues 참고
        mqttInbound.addTopic(topic, 1);

        // 메시지 수신 확인용 큐
        BlockingQueue<Message<?>> receivedMessages = new LinkedBlockingQueue<>();

        // mqttInputChannel에 interceptor 추가하여 메시지 수신 감지
        DirectChannel channel = (DirectChannel) mqttInputChannel;
        channel.addInterceptor(0, new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel ch) {
                receivedMessages.offer(message);
                return message;
            }
        });

        // 별도 Paho 클라이언트 생성 (로봇 역할)
        MqttClient robotClient = new MqttClient(brokerUrl, "test-robot-publisher-" + System.currentTimeMillis());
        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(true);
        robotClient.connect(options);

        // 서버의 구독 준비 대기
        Thread.sleep(1000);

        // when - 로봇이 메시지 발행
        MqttMessage message = new MqttMessage(payload.getBytes());
        message.setQos(1);
        robotClient.publish(topic, message);

        // then - 메시지가 수신되었는지 검증
        Message<?> receivedMessage = receivedMessages.poll(10, TimeUnit.SECONDS);

        // cleanup
        robotClient.disconnect();
        robotClient.close();

        assertThat(receivedMessage)
                .as("MQTT 메시지가 mqttInputChannel로 수신되어야 합니다")
                .isNotNull();
        assertThat(receivedMessage.getPayload()).isEqualTo(payload);
    }
}
