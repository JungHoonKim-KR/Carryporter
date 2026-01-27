package com.e101.carryporter.global.service.mqtt;

import com.e101.carryporter.support.IntegrationTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThatCode;

class MqttSubscriberServiceTest extends IntegrationTestSupport {

    @Autowired
    private MqttSubscriberService mqttSubscriberService;

    @MockitoBean
    private MqttPahoMessageHandler mqttOutbound;

    @Test
    @DisplayName("로봇 등록 메시지 수신 처리 테스트")
    void handleRegister() {
        // given
        String mac = "00:11:22:33:44:55";
        String topic = "robot/" + mac + "/register";
        String payload = "{\"mac\":\"" + mac + "\"}";

        Message<String> message = createMessage(topic, payload);

        // when & then
        assertThatCode(() -> mqttSubscriberService.handleMessage(message))
                .doesNotThrowAnyException();

        printReceivedMessage("로봇 등록", topic, payload);

    }

    @Test
    @DisplayName("로봇 상태 보고 메시지 수신 처리 테스트")
    void handleStatus() {
        // given
        String mac = "00:11:22:33:44:55";
        String topic = "robot/" + mac + "/status";
        String payload = "{\"bat\":80,\"x\":10.5,\"y\":20.3}";

        Message<String> message = createMessage(topic, payload);

        // when & then
        assertThatCode(() -> mqttSubscriberService.handleMessage(message))
                .doesNotThrowAnyException();

        printReceivedMessage("상태 보고", topic, payload);
    }

    @Test
    @DisplayName("로봇 도착 알림 메시지 수신 처리 테스트")
    void handleArrived() {
        // given
        String mac = "AA:BB:CC:DD:EE:FF";
        String topic = "robot/" + mac + "/arrived";
        String payload = "{\"missionId\":101}";

        Message<String> message = createMessage(topic, payload);

        // when & then
        assertThatCode(() -> mqttSubscriberService.handleMessage(message))
                .doesNotThrowAnyException();

        printReceivedMessage("도착 알림", topic, payload);
    }

    @Test
    @DisplayName("배송 완료 메시지 수신 처리 테스트")
    void handleDelivered() {
        // given
        String mac = "AA:BB:CC:DD:EE:FF";
        String topic = "robot/" + mac + "/delivered";
        String payload = "{\"missionId\":101}";

        Message<String> message = createMessage(topic, payload);

        // when & then
        assertThatCode(() -> mqttSubscriberService.handleMessage(message))
                .doesNotThrowAnyException();

        printReceivedMessage("배송 완료", topic, payload);
    }

    @Test
    @DisplayName("에러 발생 메시지 수신 처리 테스트")
    void handleError() {
        // given
        String mac = "12:34:56:78:90:AB";
        String topic = "robot/" + mac + "/error";
        String payload = "{\"code\":\"ERR_01\",\"msg\":\"Battery low\"}";

        Message<String> message = createMessage(topic, payload);

        // when & then
        assertThatCode(() -> mqttSubscriberService.handleMessage(message))
                .doesNotThrowAnyException();

        printReceivedMessage("에러 발생", topic, payload);
    }

    @Test
    @DisplayName("잘못된 토픽 형식 메시지 처리 테스트")
    void handleInvalidTopic() {
        // given
        String topic = "invalid/topic";
        String payload = "{}";

        Message<String> message = createMessage(topic, payload);

        // when & then
        assertThatCode(() -> mqttSubscriberService.handleMessage(message))
                .doesNotThrowAnyException();

        printReceivedMessage("잘못된 토픽", topic, payload);
    }

    @Test
    @DisplayName("알 수 없는 액션 메시지 처리 테스트")
    void handleUnknownAction() {
        // given
        String mac = "00:11:22:33:44:55";
        String topic = "robot/" + mac + "/unknown";
        String payload = "{}";

        Message<String> message = createMessage(topic, payload);

        // when & then
        assertThatCode(() -> mqttSubscriberService.handleMessage(message))
                .doesNotThrowAnyException();

        printReceivedMessage("알 수 없는 액션", topic, payload);
    }

    /**
     * 테스트용 Message 객체 생성 헬퍼 메서드
     */
    private Message<String> createMessage(String topic, String payload) {
        return MessageBuilder
                .withPayload(payload)
                .setHeader(MqttHeaders.RECEIVED_TOPIC, topic)
                .build();
    }

    /**
     * 수신 메시지 출력 헬퍼 메서드
     */
    private void printReceivedMessage(String testTitle, String topic, String payload) {
        System.out.println("\n==================================================");
        System.out.println("   TEST: " + testTitle);
        System.out.println("==================================================");
        System.out.println("TOPIC   : " + topic);
        System.out.println("PAYLOAD : " + payload);
        System.out.println("==================================================\n");
    }
}
