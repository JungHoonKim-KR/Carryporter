## 1. Message Broker 란?

- 응용 프로그램 사이에서 메시지를 전달해주는 중간 우체국 역할을 하는 소프트웨어
- 즉 application 간 메시지를 중개하는 소프트웨어

## 2. Message Broker 의 주요 메시징 패턴

### 2.1 Point to Point (Queue 방식)

- message 를 queue 에 넣는 방식
- producer (message 생성자) 가 queue 에 message 를 넣으면 consumer 가 그 message 를 받아서 처리하는 구조
- 여러 consumer 가 같은 queue 를 바라보고 있어도, 각 **message 는 딱 한번만 소비**됨
- message 가 처리되면 queue 에서 제거되므로 **작업 분산**에 적합

### 2.2 Publish/Subscribe (Topic 방식)

- publisher 가 topic 에게 message 를 발행하면, 그 topic 을 **구독하는 모든 subscriber 가 메시지를 받음**
- 예
    - 사용자가 댓글 달면 알림 서비스, 이메일 서비스, 푸시 서비스가 모두 이벤트를 받아 각자 처리
- 하나의 이벤트를 여러 시스템이 독립적으로 처리할 때 적합

## 3. Message Broker 를 사용하는 이유

> Message Broker 는 어떤 문제를 해결할까?
> 

### 3.1 비동기 처리

- A 서비스가 B 서비스의 응답을 기다리지 않고 메시지만 보내고 다른 일을 할 수 있음
- B 는 자신의 속도로 메시지를 처리

### 3.2 느슨한 결합 - Decoupling

- A 서비스는 B 서비스의 주소나 상태를 몰라도 됨.
- 그냥 Broker 에게 메시지르 보내기만 하면 됨

### 3.3 부하분산

- 여러 consumer 가 하나의 queue 를 바라보고 있으면 메시지가 자동으로 분산되어 처리

### 3.4 신뢰성

- Broker 가 message 를 보관하고 있어, Consumer 가 일시적으로 다운되어도 메시지가 사라지지 않음

## 4. Message Broker 종류와 각각 지원하는 Protocol

### 4.1 RabbitMQ

- protocol : AMPQ (Advanced Message Queuing Protocol)
    - message 지향 미들웨어를 위한 표준 프로토콜
    - tcp 기반 동작, message 전달 보장, transaction, 보안 등의 기능을 protocol level 에서 제공
    - 바이너리 프로토콜이라 효율적이고 빠름
    - mqtt, http, stomp 지원
- queue 방식과 topic 모두 지원
- Exchange 라는 개념으로 메시지 라우팅 규칙을 유연하게 설정 가능
    - Exchange
        - producer 는 큐에 직접 메시지를 던지는게 아니라 Exchange 에게 줌
        - 그러면 Exchage 가 설정된 규칙 (Binding) 에 따라 어떤 큐로보낼지 정함
        - 이덕분에 RabbitMQ 는 매우 복잡하고 유연한 라우팅이 가능
            - EX) 에러로그는 A, B 큐 둘다 보내고 일반 로그는 C 큐로만 보내

### 4.2 Kafka

- 주로 pub / sub pattern 에 특화됨
- 대용량 스트리밍 데이터 처리에 강점이 있음.
- 메시지를 로그처럼 저장해서 과게 데이터도 다시 읽을 수 있음
- kafka 자체 protocol  사용
    - TCP 위에서 동작
    - 대용량 데이터 스트리밍에 최적화

## 4.3 Redis ( Pub / Sub )

- 가벼운 메시징에 적합.
- 인메모리 기반이라 빠르지만 영속성은 보장 안함
- RESP (REdis Serialization Protocol)
    - Redis 전용 텍스트 기반
    - 매우 간단하고 사람이 읽을 수 있는 형태
    - TCP 기반으로 동작

## 4.4 MQTT Broker (Mosquitto … )

- IoT 기기 처럼 네트워크가 불안정한 환경에 최적화된  pub / sub 전용 broker
- MQTT 프로토콜 사용
    - IOT 환경을 위해 설계된 경량 프로토콜
    - TCP/IP 위에서 동작.
    - 네트워크 대역폭이 제한적이거나 불안정한 환경에 최적화 되어 있음
    - QoS 레벨을 0, 1, 2 로 설정할 수 있어 메시지 전달 보장 수준 조절 가능
    - HEADER 최소 2 바이트