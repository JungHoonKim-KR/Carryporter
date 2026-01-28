package com.e101.carryporter.global.service.mqtt;

import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.support.IntegrationTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

class MqttPublisherServiceTest extends IntegrationTestSupport {

    @Autowired
    private MqttPublisherService mqttPublisherService;

    // @Mock은 단위 테스트용이며, 통합 테스트(@SpringBootTest)에서
    // 실제 빈을 교체하려면 @MockBean을 사용해야 서비스에 주입됩니다.
    @MockitoBean
    private MqttPahoMessageHandler mqttOutbound;

    @Test
    @DisplayName("MQTT 메시지 발행 테스트")
    void publish() {
        // given
        String topic = "test/topic";
        String payload = "test payload";

        // when
        mqttPublisherService.publish(topic, payload);

        // then
        printCapturedMessage("일반 메시지 발행", topic, payload);
    }

    @Test
    @DisplayName("배송 명령 전송 테스트")
    void sendDeliverCommand() {
        // given
        String mac = "00:11:22:33:44:55";
        Location destination = Location.builder()
                .locationName("목적지")
                .description("목적지")
                .positionX(2.0)
                .positionY(3.5)
                .build();
        // when
        mqttPublisherService.sendDeliverCommand(mac, destination.getPositionX(), destination.getPositionY());

        // then
        String expectedTopic = "robot/" + mac + "/command/deliver";
        String expectedPayload = String.format("{\"destX\":%.2f,\"destY\":%.2f}", destination.getPositionX(), destination.getPositionY());

        printCapturedMessage("배송 명령", expectedTopic, expectedPayload);
    }

    @Test
    @DisplayName("복귀 명령 전송 테스트")
    void sendReturnCommand() {
        // given
        String mac = "AA:BB:CC:DD:EE:FF";
        Location station = Location.builder()
                .locationName("스테이션")
                .description("충전소")
                .positionX(0.0)
                .positionY(0.0)
                .build();

        // when
        mqttPublisherService.sendReturnCommand(mac);

        // then
        String expectedTopic = "robot/" + mac + "/command/return";
        String expectedPayload = String.format("{\"homeX\":%.2f,\"homeY\":%.2f}", station.getPositionX(), station.getPositionY());

        printCapturedMessage("복귀 명령", expectedTopic, expectedPayload);
    }

    @Test
    @DisplayName("긴급 정지 명령 전송 테스트")
    void sendStopCommand() {
        // given
        String mac = "12:34:56:78:90:AB";

        // when
        mqttPublisherService.sendStopCommand(mac);

        // then
        String expectedTopic = "robot/" + mac + "/command/stop";
        String expectedPayload = "{}";

        printCapturedMessage("긴급 정지", expectedTopic, expectedPayload);
    }

    /**
     * 검증 및 출력을 담당하는 헬퍼 메서드
     */
    private void printCapturedMessage(String testTitle, String expectedTopic, String expectedPayload) {
        ArgumentCaptor<Message<String>> messageCaptor = ArgumentCaptor.forClass(Message.class);
        verify(mqttOutbound).handleMessage(messageCaptor.capture());

        Message<String> capturedMessage = messageCaptor.getValue();
        String actualTopic = (String) capturedMessage.getHeaders().get(MqttHeaders.TOPIC);
        String actualPayload = capturedMessage.getPayload();

        // 검증 (Assertions)
        assertThat(actualTopic).isEqualTo(expectedTopic);
        assertThat(actualPayload).isEqualTo(expectedPayload);

        // 콘솔 출력 (Visual Output)
        System.out.println("\n==================================================");
        System.out.println("   🧪 TEST: " + testTitle);
        System.out.println("==================================================");
        System.out.println("✅ TOPIC   : " + actualTopic);
        System.out.println("✅ PAYLOAD : " + actualPayload);
        System.out.println("==================================================\n");
    }
}