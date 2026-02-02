//package com.e101.carryporter.global.service.mqtt;
//
//import com.e101.carryporter.domain.robot.service.RobotService;
//import com.e101.carryporter.support.IntegrationTestSupport;
//import org.eclipse.paho.client.mqttv3.MqttClient;
//import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
//import org.eclipse.paho.client.mqttv3.MqttMessage;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.mockito.Mockito;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.test.context.bean.override.mockito.MockitoBean;
//
//import java.util.concurrent.BlockingQueue;
//import java.util.concurrent.LinkedBlockingQueue;
//import java.util.concurrent.TimeUnit;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//class MqttIntegrationTest extends IntegrationTestSupport {
//
//    @Autowired
//    private MqttPublisherService mqttPublisherService;
//
//    @MockitoBean
//    private RobotService robotService;
//
//    @Value("${mqtt.broker.url}")
//    private String brokerUrl;
//
//    @Test
//    @DisplayName("MQTT 통합 테스트 - 메시지 발행 및 수신 확인")
//    void testMqttPublishAndSubscribe() throws Exception {
//        // given
//        String mac = "test-mac";
//        String topic = "robot/" + mac + "/register";
//        String payload = "{\"status\":\"ok\"}";
//
//        BlockingQueue<String> messageQueue = new LinkedBlockingQueue<>();
//
//        // 별도의 Paho 클라이언트로 구독
//        MqttClient subscriber = new MqttClient(brokerUrl, "test-subscriber-client-" + System.currentTimeMillis());
//        MqttConnectOptions options = new MqttConnectOptions();
//        options.setCleanSession(true);
//        subscriber.connect(options);
//
//        subscriber.subscribe(topic, (t, msg) -> {
//            messageQueue.offer(new String(msg.getPayload()));
//        });
//
//        // 구독 완료 대기
//        Thread.sleep(1000);
//
//        // when
//        mqttPublisherService.publish(topic, payload);
//
//        // then
//        String receivedMessage = messageQueue.poll(10, TimeUnit.SECONDS);
//
//        // cleanup
//        subscriber.disconnect();
//        subscriber.close();
//
//        assertThat(receivedMessage).isNotNull();
//        assertThat(receivedMessage).isEqualTo(payload);
//    }
//
//    @Test
//    @DisplayName("MQTT 수신 통합 테스트 - 외부 발행 메시지를 MqttSubscriberService가 수신하여 RobotService 호출")
//    void testMqttSubscriberReceivesMessage() throws Exception {
//        // given
//        String mac = "test-robot-mac";
//        String topic = "robot/" + mac + "/register";
//        String payload = "{\"mac\":\"" + mac + "\"}";
//
//        // 별도 Paho 클라이언트 생성 (로봇 역할)
//        MqttClient robotClient = new MqttClient(brokerUrl, "test-robot-publisher-" + System.currentTimeMillis());
//        MqttConnectOptions options = new MqttConnectOptions();
//        options.setCleanSession(true);
//        robotClient.connect(options);
//
//        // 서버의 구독 준비 대기
//        Thread.sleep(1000);
//
//        // when - 로봇이 메시지 발행
//        MqttMessage message = new MqttMessage(payload.getBytes());
//        message.setQos(1);
//        robotClient.publish(topic, message);
//
//        // then - MqttSubscriberService가 robotService.registerRobot()을 호출했는지 검증
//        // Paho 콜백은 비동기로 동작하므로, 약간의 대기 후 검증
//        Mockito.verify(robotService, Mockito.timeout(5000).times(1))
//                .registerRobot(mac);
//
//        // cleanup
//        robotClient.disconnect();
//        robotClient.close();
//    }
//}
