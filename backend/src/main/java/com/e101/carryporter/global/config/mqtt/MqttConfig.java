package com.e101.carryporter.global.config.mqtt;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.messaging.MessageChannel;
import org.springframework.util.StringUtils;

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
            "robot/+/status",     // 상태 보고
            "robot/+/arrived",    // 도착 알림
            "robot/+/delivered",  // 배송 완료
            "robot/+/error"       // 에러 발생
    };

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();

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

        factory.setConnectionOptions(options);
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
    @ConditionalOnMissingBean(name = "mqttInputChannel")
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MqttPahoMessageDrivenChannelAdapter mqttInbound(
            MqttPahoClientFactory mqttClientFactory,
            MessageChannel mqttInputChannel) {

        // Spring Integration MQTT 6.x에서는 URL을 명시적으로 전달하는 생성자 사용 필요
        // clientId만 전달하는 생성자는 내부 URL이 null이 되어 연결되지 않음
        String[] serverURIs = mqttClientFactory.getConnectionOptions().getServerURIs();
        String url = serverURIs != null && serverURIs.length > 0 ? serverURIs[0] : null;

        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(
                url, clientId + "-subscriber", mqttClientFactory, SUBSCRIBE_TOPICS);

        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttInputChannel);

        return adapter;
    }
}
