# Spring Integration MQTT 메시지 흐름 학습 자료

## 1. 전체 아키텍처

```
┌─────────┐        ┌──────────────┐        ┌─────────────────────────┐
│  로봇   │──MQTT──▶│  Mosquitto   │──MQTT──▶│  Spring Boot 서버       │
│ (Paho)  │◀──MQTT──│  브로커      │◀──MQTT──│                         │
└─────────┘        └──────────────┘        └─────────────────────────┘
```

- **Upstream (로봇 → 서버)**: 로봇이 상태/이벤트를 발행, 서버가 구독하여 수신
- **Downstream (서버 → 로봇)**: 서버가 명령을 발행, 로봇이 구독하여 수신

---

## 2. 토픽 설계

모든 토픽은 `robot/{MAC}/{action}` 형식을 따른다.

| 방향 | 토픽 패턴 | 설명 |
|------|-----------|------|
| Upstream | `robot/{MAC}/register` | 로봇 기기 등록 |
| Upstream | `robot/{MAC}/status` | 배터리, 위치 등 상태 보고 |
| Upstream | `robot/{MAC}/arrived` | 목적지 도착 알림 |
| Upstream | `robot/{MAC}/delivered` | 배송 완료 알림 |
| Upstream | `robot/{MAC}/error` | 에러 발생 보고 |

서버는 와일드카드 `+`를 사용하여 모든 로봇의 메시지를 한 번에 구독한다:
```
robot/+/register
robot/+/status
robot/+/arrived
robot/+/delivered
robot/+/error
```

> `+`는 MQTT 단일 레벨 와일드카드로, 해당 위치의 모든 값과 매칭된다.
> 예: `robot/+/status`는 `robot/AA:BB:CC/status`, `robot/11:22:33/status` 모두 매칭

---

## 3. 발행 흐름 (서버 → 로봇) 상세

비즈니스 로직에서 로봇에게 명령을 보내는 전체 흐름이다.

```
예시: 관리자가 로봇에게 배송 명령을 내린다

    ┌───────────────────────────────────────────────────────────────┐
    │  비즈니스 로직 (Controller / Service 계층)                      │
    │                                                               │
    │  mqttPublisherService.sendDeliverCommand("AA:BB:CC", 10, 20); │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (1) 호출
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  MqttPublisherService.sendDeliverCommand()                    │
    │  ── MqttPublisherService.java:44-48 ──                        │
    │                                                               │
    │  payload = '{"destX":10.00,"destY":20.00}'                    │
    │  topic  = "robot/AA:BB:CC/command/deliver"                    │
    │                                                               │
    │  → sendCommand(mac, "deliver", payload) 호출                   │
    │    → publish(topic, payload) 호출                              │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (2) Spring Message 생성
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  MqttPublisherService.publish()                               │
    │  ── MqttPublisherService.java:21-27 ──                        │
    │                                                               │
    │  Message<String> message = MessageBuilder                     │
    │      .withPayload(payload)                                    │
    │      .setHeader(MqttHeaders.TOPIC, topic)  ← 토픽을 헤더에 설정 │
    │      .build();                                                │
    │                                                               │
    │  mqttOutbound.handleMessage(message);  ← 핸들러에 직접 전달     │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (3) MQTT 프로토콜로 변환 및 전송
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  MqttPahoMessageHandler (mqttOutbound 빈)                     │
    │  ── MqttConfig.java:66-72 ──                                  │
    │                                                               │
    │  - Spring Message → MQTT PUBLISH 패킷으로 변환                 │
    │  - 헤더의 MqttHeaders.TOPIC 값을 MQTT 토픽으로 사용             │
    │  - setAsync(true): 비동기 전송 (응답 대기 안 함)                │
    │  - 클라이언트 ID: "{clientId}-publisher"                       │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (4) TCP 소켓으로 MQTT PUBLISH 패킷 전송
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  Mosquitto 브로커                                              │
    │                                                               │
    │  토픽 "robot/AA:BB:CC/command/deliver"를 구독 중인              │
    │  클라이언트(로봇)에게 메시지를 전달                               │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (5) 브로커가 매칭된 구독자에게 push
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  로봇 (MQTT 클라이언트)                                        │
    │                                                               │
    │  "robot/AA:BB:CC/command/#" 등을 구독 중                       │
    │  → payload '{"destX":10.00,"destY":20.00}' 수신               │
    │  → 배송 동작 수행                                              │
    └───────────────────────────────────────────────────────────────┘
```

### 발행 메서드 정리

| 메서드 | 토픽 | 페이로드 | 파일 위치 |
|--------|------|----------|-----------|
| `publish(topic, payload)` | 직접 지정 | 직접 지정 | `MqttPublisherService.java:21` |
| `sendCommand(mac, action, json)` | `robot/{mac}/command/{action}` | 직접 지정 | `MqttPublisherService.java:33` |
| `sendDeliverCommand(mac, x, y)` | `robot/{mac}/command/deliver` | `{"destX":x,"destY":y}` | `MqttPublisherService.java:44` |
| `sendReturnCommand(mac, x, y)` | `robot/{mac}/command/return` | `{"homeX":x,"homeY":y}` | `MqttPublisherService.java:56` |
| `sendStopCommand(mac)` | `robot/{mac}/command/stop` | `{}` | `MqttPublisherService.java:67` |

호출 관계:
```
sendDeliverCommand / sendReturnCommand / sendStopCommand
       │
       ▼
  sendCommand(mac, action, payload)   ← 토픽 조립: "robot/{mac}/command/{action}"
       │
       ▼
  publish(topic, payload)             ← Spring Message 생성 → mqttOutbound 전달
```

---

## 4. 구독 흐름 (로봇 → 서버) 상세

로봇이 발행한 메시지를 서버가 수신하여 처리하는 전체 흐름이다.

```
예시: 로봇이 상태 보고 메시지를 발행한다

    ┌───────────────────────────────────────────────────────────────┐
    │  로봇 (MQTT 클라이언트)                                        │
    │                                                               │
    │  토픽: "robot/AA:BB:CC/status"                                │
    │  페이로드: '{"bat":80,"x":10.5,"y":20.3}'                     │
    │  → MQTT PUBLISH 패킷 전송                                     │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (1) TCP 소켓으로 MQTT PUBLISH 패킷 전송
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  Mosquitto 브로커                                              │
    │                                                               │
    │  토픽 매칭: "robot/AA:BB:CC/status"                            │
    │       vs 구독 패턴: "robot/+/status"  → 매칭 성공 (+ 와일드카드) │
    │                                                               │
    │  → 매칭된 구독자(Spring 서버)에게 메시지 전달                     │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (2) 브로커가 구독자에게 push
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  MqttPahoMessageDrivenChannelAdapter (mqttInbound 빈)         │
    │  ── MqttConfig.java:83-101 ──                                 │
    │                                                               │
    │  [앱 시작 시 초기화]                                            │
    │  - 브로커에 TCP 연결 (클라이언트 ID: "{clientId}-subscriber")    │
    │  - 5개 와일드카드 토픽 SUBSCRIBE 패킷 전송                       │
    │    "robot/+/register", "robot/+/status", ...                  │
    │                                                               │
    │  [메시지 수신 시]                                               │
    │  - Paho 콜백 messageArrived() 호출됨                           │
    │  - DefaultPahoMessageConverter가 MQTT 바이트 → Spring Message  │
    │    변환:                                                       │
    │    Message<String>                                            │
    │    ├─ payload: '{"bat":80,"x":10.5,"y":20.3}'                │
    │    └─ headers:                                                │
    │       ├─ mqtt_receivedTopic: "robot/AA:BB:CC/status"         │
    │       ├─ mqtt_receivedQos: 1                                 │
    │       └─ mqtt_receivedRetained: false                        │
    │                                                               │
    │  - outputChannel(mqttInputChannel)로 메시지 전달               │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (3) Message<String> 전달
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  DirectChannel (mqttInputChannel 빈)                          │
    │  ── MqttConfig.java:77-80 ──                                  │
    │                                                               │
    │  - 동기 채널: 메시지를 받으면 즉시 구독자에게 전달               │
    │  - 구독자 = @ServiceActivator가 연결된 메서드                   │
    │  - 별도 스레드 풀 없이 호출자 스레드에서 직접 실행               │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (4) @ServiceActivator 바인딩으로 자동 호출
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  MqttSubscriberService.handleMessage(Message<?> message)      │
    │  ── MqttSubscriberService.java:22-61 ──                       │
    │                                                               │
    │  (a) 헤더에서 토픽 추출                                        │
    │      topic = "robot/AA:BB:CC/status"                          │
    │                                                               │
    │  (b) 토픽 파싱                                                 │
    │      topicParts = ["robot", "AA:BB:CC", "status"]             │
    │      mac    = "AA:BB:CC"                                      │
    │      action = "status"                                        │
    │                                                               │
    │  (c) switch 분기                                               │
    │      case "register"  → handleRegister(mac, payload)          │
    │      case "status"    → handleStatus(mac, payload)   ← 여기!  │
    │      case "arrived"   → handleArrived(mac, payload)           │
    │      case "delivered" → handleDelivered(mac, payload)         │
    │      case "error"     → handleError(mac, payload)             │
    └───────────────────────┬───────────────────────────────────────┘
                            │
                            │ (5) action별 비즈니스 로직 실행
                            ▼
    ┌───────────────────────────────────────────────────────────────┐
    │  MqttSubscriberService.handleStatus()                         │
    │  ── MqttSubscriberService.java:85-98 ──                       │
    │                                                               │
    │  JsonNode node = objectMapper.readTree(payload);              │
    │  battery = 80                                                 │
    │  x = 10.5                                                     │
    │  y = 20.3                                                     │
    │                                                               │
    │  // TODO: robotService.updateStatus(mac, battery, x, y)       │
    └───────────────────────────────────────────────────────────────┘
```

### 구독 토픽과 처리 메서드 매핑

| 구독 패턴 | 매칭 예시 | 처리 메서드 | 파일 위치 |
|-----------|----------|------------|-----------|
| `robot/+/register` | `robot/AA:BB:CC/register` | `handleRegister(mac, payload)` | `MqttSubscriberService.java:68` |
| `robot/+/status` | `robot/AA:BB:CC/status` | `handleStatus(mac, payload)` | `MqttSubscriberService.java:85` |
| `robot/+/arrived` | `robot/AA:BB:CC/arrived` | `handleArrived(mac, payload)` | `MqttSubscriberService.java:105` |
| `robot/+/delivered` | `robot/AA:BB:CC/delivered` | `handleDelivered(mac, payload)` | `MqttSubscriberService.java:124` |
| `robot/+/error` | `robot/AA:BB:CC/error` | `handleError(mac, payload)` | `MqttSubscriberService.java:143` |

---

## 4. 핵심 구성요소 상세

### 4.1 MqttPahoClientFactory — 연결 설정 공장

```java
@Bean
public MqttPahoClientFactory mqttClientFactory() {
    DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();

    MqttConnectOptions options = new MqttConnectOptions();
    options.setServerURIs(new String[]{brokerUrl});  // 브로커 주소
    options.setCleanSession(true);                   // 세션 초기화
    options.setAutomaticReconnect(true);             // 자동 재연결
    options.setConnectionTimeout(10);                // 연결 타임아웃(초)
    options.setKeepAliveInterval(60);                // Keep-Alive 간격(초)

    factory.setConnectionOptions(options);
    return factory;
}
```

**역할**: Outbound(발행)와 Inbound(구독) 양쪽에서 공유하는 연결 설정을 제공한다.

| 옵션 | 값 | 의미 |
|------|----|------|
| `cleanSession` | `true` | 연결 시 이전 세션 정보를 지우고 새로 시작 |
| `automaticReconnect` | `true` | 연결 끊김 시 자동으로 재연결 시도 |
| `connectionTimeout` | `10` | 10초 내 연결 안 되면 실패 처리 |
| `keepAliveInterval` | `60` | 60초마다 PINGREQ를 보내 연결 유지 확인 |

---

### 4.2 Outbound — 서버가 메시지를 발행하는 경로

```java
@Bean
public MqttPahoMessageHandler mqttOutbound(MqttPahoClientFactory mqttClientFactory) {
    MqttPahoMessageHandler handler = new MqttPahoMessageHandler(
            clientId + "-publisher", mqttClientFactory);
    handler.setAsync(true);         // 비동기 발행
    handler.setDefaultTopic("default");
    return handler;
}
```

```
MqttPublisherService.publish(topic, payload)
       │
       ▼
MqttPahoMessageHandler (mqttOutbound)
       │
       ▼
Mosquitto 브로커 ──▶ 로봇
```

- `MqttPublisherService`가 토픽과 페이로드를 지정하여 `mqttOutbound`에 전달
- `mqttOutbound`가 브로커에 MQTT PUBLISH 패킷을 전송
- 클라이언트 ID: `{clientId}-publisher` (브로커에서 클라이언트를 식별)

---

### 4.3 Inbound — 서버가 메시지를 수신하는 경로

```java
@Bean
public MessageChannel mqttInputChannel() {
    return new DirectChannel();
}

@Bean
public MqttPahoMessageDrivenChannelAdapter mqttInbound(
        MqttPahoClientFactory mqttClientFactory,
        MessageChannel mqttInputChannel) {

    String[] serverURIs = mqttClientFactory.getConnectionOptions().getServerURIs();
    String url = serverURIs != null && serverURIs.length > 0 ? serverURIs[0] : null;

    MqttPahoMessageDrivenChannelAdapter adapter =
        new MqttPahoMessageDrivenChannelAdapter(
            url,                          // 브로커 URL (명시적 전달 필수)
            clientId + "-subscriber",     // 클라이언트 ID
            mqttClientFactory,            // 연결 설정
            SUBSCRIBE_TOPICS);            // 구독할 토픽 배열

    adapter.setCompletionTimeout(5000);
    adapter.setConverter(new DefaultPahoMessageConverter());
    adapter.setQos(1);                    // At Least Once 보장
    adapter.setOutputChannel(mqttInputChannel);

    return adapter;
}
```

**구성 요소 역할 정리**:

| 구성 요소 | 역할 |
|-----------|------|
| `MqttPahoMessageDrivenChannelAdapter` | MQTT 클라이언트로 브로커에 연결하고 토픽 구독. 메시지 도착 시 Spring `Message`로 변환 |
| `DefaultPahoMessageConverter` | MQTT 바이트 페이로드 → Spring `Message<String>` 변환 |
| `DirectChannel` | 동기적으로 메시지를 구독자(`@ServiceActivator`)에게 전달 |
| `QoS 1` | 브로커가 최소 1회 전달을 보장 (메시지 유실 방지) |

> **주의**: Spring Integration MQTT 6.x에서는 URL을 생성자에 명시적으로 전달해야 한다.
> `clientId`만 전달하는 생성자를 사용하면 내부 URL이 `null`이 되어 연결되지 않는다.

---

### 4.4 MqttSubscriberService — 비즈니스 로직 처리

```java
@ServiceActivator(inputChannel = "mqttInputChannel")
public void handleMessage(Message<?> message) {
    String topic = message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC);
    String payload = (String) message.getPayload();

    String[] topicParts = topic.split("/");
    // topicParts[0] = "robot"
    // topicParts[1] = MAC 주소
    // topicParts[2] = action (register, status, arrived, delivered, error)

    String mac = topicParts[1];
    String action = topicParts[2];

    switch (action) {
        case "register"  -> handleRegister(mac, payload);
        case "status"    -> handleStatus(mac, payload);
        case "arrived"   -> handleArrived(mac, payload);
        case "delivered" -> handleDelivered(mac, payload);
        case "error"     -> handleError(mac, payload);
    }
}
```

**핵심 포인트**:
- `@ServiceActivator(inputChannel = "mqttInputChannel")`이 채널과 메서드를 연결
- 별도의 구독 로직 없이, Spring Integration이 채널에 메시지가 도착하면 자동으로 이 메서드를 호출
- 토픽 문자열을 파싱하여 MAC 주소와 action을 추출한 뒤 분기 처리

---

## 5. Spring Message 객체 구조

`mqttInputChannel`을 통해 전달되는 `Message` 객체의 구조:

```
Message<String>
├── payload: "{\"bat\":80,\"x\":10.5,\"y\":20.3}"    ← MQTT 페이로드 (문자열)
└── headers:
    ├── mqtt_receivedTopic: "robot/AA:BB:CC/status"  ← 수신된 토픽
    ├── mqtt_receivedQos: 1                          ← QoS 레벨
    ├── mqtt_receivedRetained: false                  ← Retained 메시지 여부
    └── mqtt_id: 0                                   ← 메시지 ID
```

---

## 6. QoS (Quality of Service) 레벨

| QoS | 이름 | 의미 | 이 프로젝트 사용 |
|-----|------|------|-----------------|
| 0 | At Most Once | 최대 1회 전달, 유실 가능 | - |
| 1 | At Least Once | 최소 1회 전달, 중복 가능 | Inbound 구독에 사용 |
| 2 | Exactly Once | 정확히 1회 전달 | - |

QoS 1을 사용하므로 로봇의 상태 보고나 도착 알림이 유실되지 않는다.
다만 중복 수신 가능성이 있으므로 비즈니스 로직에서 멱등성을 고려해야 한다.

---

## 7. 클라이언트 ID 구분

| 빈 | 클라이언트 ID | 역할 |
|----|--------------|------|
| `mqttOutbound` | `{clientId}-publisher` | 서버 → 브로커 발행 전용 |
| `mqttInbound` | `{clientId}-subscriber` | 브로커 → 서버 구독 전용 |

MQTT 브로커는 클라이언트 ID로 연결을 구분하기 때문에, 발행과 구독에 서로 다른 ID를 사용해야 한다.
같은 ID를 쓰면 브로커가 기존 연결을 끊고 새 연결로 교체한다.

---

## 8. Testcontainers 기반 통합 테스트 환경

```
┌─ Docker ──────────────────────────────────┐
│                                           │
│  ┌─────────┐  ┌───────┐  ┌────────────┐  │
│  │  MySQL   │  │ Redis │  │ Mosquitto  │  │
│  │  :3306   │  │ :6379 │  │  :1883     │  │
│  └─────────┘  └───────┘  └────────────┘  │
│       ↕            ↕           ↕          │
│   랜덤 포트     랜덤 포트    랜덤 포트      │
└───────────────────────────────────────────┘
        ↕            ↕           ↕
┌───────────────────────────────────────────┐
│          Spring Boot Test Context          │
│                                           │
│  @ServiceConnection  → MySQL, Redis 자동   │
│  @DynamicPropertySource → MQTT 수동 설정   │
└───────────────────────────────────────────┘
```

```java
// IntegrationTestSupport.java
static GenericContainer<?> mosquitto = new GenericContainer<>("eclipse-mosquitto:2.0")
        .withExposedPorts(1883)
        .withCopyFileToContainer(
            MountableFile.forClasspathResource("mosquitto/mosquitto.conf"),
            "/mosquitto/config/mosquitto.conf")
        .waitingFor(Wait.forListeningPort());

@DynamicPropertySource
static void mqttProperties(DynamicPropertyRegistry registry) {
    registry.add("MQTT_HOST", () -> mosquitto.getHost());
    registry.add("MQTT_PORT", () -> mosquitto.getMappedPort(1883));
}
```

- Testcontainers가 Docker로 Mosquitto를 띄우고 랜덤 포트를 매핑
- `@DynamicPropertySource`가 매핑된 포트를 `application-test.yml`의 `${MQTT_PORT}`에 주입
- 테스트마다 실제 브로커와 통신하여 진짜 MQTT 흐름을 검증

---

## 9. 알려진 이슈 — Spring Integration MQTT 6.x 와일드카드 버그

`MqttPahoMessageDrivenChannelAdapter`의 `messageArrived()` 내부 구현:

```java
// Spring Integration 소스 코드
Arrays.asList(getTopic()).contains(topic)  // 정확한 문자열 비교
```

구독 토픽이 `robot/+/status`이고, 수신된 메시지 토픽이 `robot/AA:BB:CC/status`인 경우:
- 브로커는 와일드카드 매칭으로 정상 전달
- 어댑터는 `"robot/+/status".equals("robot/AA:BB:CC/status")` → `false`로 메시지를 무시

**운영 환경에서는 정상 동작하는 경우가 많지만**, 테스트에서는 이 문제가 발생할 수 있다.

**테스트 우회 방법**:
```java
// 정확한 토픽을 추가 등록하여 우회
mqttInbound.addTopic("robot/test-robot-mac/status", 1);
```
