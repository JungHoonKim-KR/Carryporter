package com.e101.carryporter.global.config.mqtt;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.messaging.MessageChannel;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
public class MqttConfig {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.broker.username:}")
    private String brokerUsername;

    @Value("${mqtt.broker.password:}")
    private String brokerPassword;

    // 서버가 구독할 토픽 패턴들 (Upstream: 로봇 → 서버)
    private static final String[] SUBSCRIBE_TOPICS = {
        "robot/+/register",   // 기기 등록
        "robot/+/arrived",    // 사용자 위치 도착
        "robot/+/locked",     // 잠금 완료
        "robot/+/unlocked",   // 잠금 해제 완료
        "robot/+/returned",   // 스테이션 복귀 완료
        "robot/+/IDLE",       // 스테이션 복귀 완료 (IDLE 상태)
        "robot/+/error"       // 에러 발생
    };

    @Bean
    public MqttConnectOptions mqttConnectOptions() {
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{brokerUrl});
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        options.setConnectionTimeout(10);
        options.setKeepAliveInterval(60);

        if (StringUtils.hasText(brokerUsername)) {
            options.setUserName(brokerUsername);
        }
        if (StringUtils.hasText(brokerPassword)) {
            options.setPassword(brokerPassword.toCharArray());
        }

        return options;
    }

    @Bean
    public MqttPahoClientFactory mqttClientFactory(MqttConnectOptions mqttConnectOptions) {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        factory.setConnectionOptions(mqttConnectOptions);
        return factory;
    }

    // ==================== Outbound (메시지 발행: 서버 → 로봇) ====================

    @Bean
    public MqttPahoMessageHandler mqttOutbound(MqttPahoClientFactory mqttClientFactory) {
        MqttPahoMessageHandler handler = new MqttPahoMessageHandler(
            clientId + "-publisher", mqttClientFactory);
        handler.setAsync(true);
        handler.setDefaultTopic("default");
        return handler;
    }

    // ==================== Inbound (메시지 구독: 로봇 → 서버) ====================

    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MqttPahoMessageDrivenChannelAdapter mqttInbound(MqttPahoClientFactory mqttClientFactory) {
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(
            clientId + "-subscriber", mqttClientFactory, SUBSCRIBE_TOPICS);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new org.springframework.integration.mqtt.support.DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttInputChannel());
        return adapter;
    }
}
