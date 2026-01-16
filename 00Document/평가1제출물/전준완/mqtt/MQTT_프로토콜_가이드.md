## 1. MQTT 개요 및 아키텍처

### MQTT 란?

- Message Queuing Telemetry Transport 의 약자.
- 직역하면 메시지 큐잉 원격 측정 전송 프로토콜
    - message queuing : 메시지를 한줄로 세워 차례대로 처리한다.
        - 현대 MQTT 는 Queue 구조보다는 sub / pub 방식에 더 가깝지만 이름은 유지되는중
    - telemetry : 원격 측정
        - 멀리 떨어져 있는 기기의 상태나 측정 (metry) 값 을 수집한다는 의미
        - IoT 의 핵심 목적임
    - tranport: 전송
        - 데이터를 한 지점에서 다른 지점으로 실어 나른다는 의미
- 즉 **멀리 떨어진 기기로 부터 수집한 정보를 가볍고 빠르게 주고받는 통신 규약**

### 중앙 집중형 아키텍쳐

- MQTT 는 1 : 1 로 연결하지 않고, 가운데 Message Broker 를 두는 Star 토폴로지를 가짐
    - start 토폴로지
        - 중앙에 있는 하나의 **핵심 노드**를 중심으로 모든 기기들이 1 : 1 로 연결되어있는 형태
        - 이 핵심 노드가 바로 Message Broker
- Message Broker
    - 모든 통신의 허브
    - 모든 메시지를 수신해서 적절한 대상에게 배달함
    - Mosquitto, EMQX, HiveMQ 등 있음
- Clients
    - Message broker 에게 연결된 모든 장치를 의미

### pub / sub 모델의 핵심 원리

- 이 모델의 가장 큰 장점은 **서로의 존재를 몰라도 대화가 가능하다** 라는 점
- 이를 **decoupling** 이라고 부름
- publish (발행)
    - 데이터를 보내는 행위.
    - 보낼때 반드시 특정 주소인 topic 을 지정해야함.
        - ex: 센서가 `home/temp` 라는 토픽으로 `25` 라는 데이터를 보냄
- subscribe (구독)
    - 특정 토픽의 데이터를 받겠다고 브로커에게 신청하는 행위
        - ex: 스마트폰 앱이 `home/temp` 를 구독
- topic
    - 메시지가 게시될 주소 또는 채널과 같은 개념
    - 발행자와 구독자는 이 토픽을 통해 서로 몰라도 데이터를 주고 받을 수 있음
    - 특징
        - 토픽은 미리 생성되는 것이 아닌, 누군가 그 이름으로 메시지를 보내거나 구독을 신청하는 순간 동적으로 생성됨.
    - 토픽 구조
        - `/`  계층적 구분
            - `/` 사용해 계층적으로 구조를 만듬
            - `건물명/층수/방번호/장치종류/데이터`
            - `myhome/livingroom/light/status`
    - wild card
        - 구독자는 여러 토픽을 한번에 구독하기 위해 특수 기호를 사용가능
            - `+` : single - level
                - 딱 한계층만 대체
                - `myhome/+/temp`
                    - `myhome/livingroom/temp`  `myhome/bedroom/temp` 가능
                    - `myhome/kitchen/fridge/temp`  불가능
            - `#` : multi-level
                - 지정된 계층 아래의 모든 데이터를 다받음.
                - 반드시 토픽의 맨 마지막에만 쓸 수 있음
                - `myhome/#`  → `myhome` 으로 시작하는 모든 데이터를 다 받음
        - topic 설계시 주의사항
            1. 대소문자 구분됨
            2. 맨 앞 `/` 금지
            3. 공백 및 특수문자 피하기 
- topic 기반 매칭
    - broker 는 발행된 메시지의 topic 을 보고 그 토픽을 구독중인 모든 client 들에게 메시지를 뿌려줌
- 간단 예시
    - publisher → 기자
    - broker → 신문사
    - subscriber → 구독자
    - 기자가 발행한 신문을 신문사는 이를 구독하는 구독자에게 전달.

## 2. 연결 매커니즘

### TCP/IP 기반의 연결

- MQTT 는 데이터 신뢰성을 위해 TCP Connection 위에서 동작
- 연결 지향성
    - 데이터를 주고받기 전, 반드시 클라이언트와 브로커 사이에 물리적인 Socket 이 연결되어 있어야 함.
- 신뢰성
    - packet 이 유실될 경우 TCP 가 재전송을 담당하기 때문에, MQTT 는 메시지 내용에만 집중할 수 있음

### 3단계 연결 과정 (Handshake)

- 기기가 브로커에 접속할 때 아래 순서를 따름
    1. TCP 3-way handshake 
        1. 클라이언트가 브로커의 ip / port 로 syn packet 을 보내고 ack 를 주고 받으며 TCP 세션을 맺음
    2. MQTT Connect 
        1. TCP 연결이 되면, 클라이언트는 브로커에게 MQTT 전용 Connect packet 을 보냄
        2. 담기는 정보는 다음과 같음
            1. client id : broker 가 기기를 식별하는 고유 이름 (중복시 기존 기기 퇴출)
            2. keep alive : 생존 보고용 ping 보내는 시간
                1. 60 → 60 초 마다 piing
            3. clean session:
                1. 예전 기록 다 지우고 새로 시작하기 → true
                2. 예전에 왔던 못받은 데이터 있으면 줘 → false
            4. Will (유언장)
                1. 비정상 종료시 뿌려질 메시지 
    3. MQTT CONNACK (승인)
        1. 브로커가 해당 기기를 식별했고 연결을 완료할 경우 MQTT Connection 이 완료됨 

### Keep alive 와 Ping

- 상태 유지
    - http 와 달리 connection 을 끊지 않음
- ping
    - data 를 보낼게 없어도 클라이언트는 주기적으로 PINGREQ 를 보내고 브로커는 PINGRESP 로 답하며 연결을 확인함

## 3. 메시지 구조와 효율성

- MQTT 는 사람이 읽기 좋은 text (plain text) 가 아니라 컴퓨터가 읽기 좋은 이진 데이터로 되어 있어 크기가 매우 작음
- 하나의 MQTT pakcet 은 크게 3부분으로 나뉨
    1. FIXED HEADER - 필수
        1. 모든 패킷에 반드시 포함되며 최소 2바이트
        2. 다음으로 구성
            1. packet type : PUBLISH / SUBSCRIBE 등
            2. QoS 레벨
            3. 데이터 전체길이 정보 
    2. VARIABLE HEADER - 선택
        1. PACKET 종류에 따라 추가 정보가 필요할 때 사용
        2. 다음으로 구성
            1. Topic 이름
            2. Message 번호 등이 담김
                1. application level 에서 한번더 데이터가 정상적으로 왔는지 확인하기 위한 번호
                2. QoS level 1, 2 설정시 사용됨 
    3. PAYLOAD - 선택
        1. 실제 우리가 보내고 싶은 데이터 본문
        2. MQTT 는 본문 내용 검사 안함.  → JSON, Plain text, 이진 이미지 등 어떤 포멧이든 담을 수 있음 

- Http 대비 효율성
    - HTTP : 요청할 때 마다 host, user-agent, cookie 등 수백 바이트의 텍스트 헤더를 매번 보냄
    - MQTT : 이미 연결된 상태에서 단 2byte 의 고정헤더와 topic 명만 붙여 데이터를 던짐
        - 이 차이덕분에 저전력 기기에서 배터리를 획기적으로 아낄 수 있음

## 4. 신뢰성 및 가용성 옵션

### QoS (Quality of Service) - 전송 품질 3단계

- 메시지를 얼마나 확실하게 보내느냐를 결정

| **레벨** | **이름** | **특징** | **용도** |
| --- | --- | --- | --- |
| **0** | At most once | 딱 한 번만 보냄. 유실 가능성 있음. | 1초마다 보내는 온도값 |
| **1** | At least once | ACK를 받을 때까지 반복 전송. 중복 가능성 있음. | 일반적인 상태 제어 (가장 많이 씀) |
| **2** | Exactly once | 4-way 핸드쉐이크로 정확히 한 번 전달 보장. | 결제, 정밀 기기 제어 |

### LWT (Last Will and Testament) - 유언장

- 기기가 사고로 인한 비정상 종료 (정전, 네트워크 단절 등) 되었을 때 브로커가 대신 뿌려주는 메시지
- 작동
    - CONNECT 단계에서 미리 브로커에게 유언을 맡겨둠
- 만약 정상적 종료일 경우 유언장은 파기됨

### Retain Message

- 브로커가 특정 토픽의 마지막 message 를 기억하고 있는 기능
- 장점
    - 새로운 구독자가 접속했을 때, 다음 데이터가 발행될 때 까지 기다릴 필요 없이 즉시 마지막 상태값을 받아볼 수 있음

## 5. 시나리오

| **구간** | **연결 주체** | **프로토콜** | **주요 역할** |
| --- | --- | --- | --- |
| **A 구간** | **IoT 기기 ↔ 브로커** | **MQTT (TCP/IP)** | 센서 데이터 발행(Pub), 제어 명령 수신(Sub) |
| **B 구간** | **Spring 서버 ↔ 브로커** | **MQTT (TCP/IP)** | 기기 데이터 수집(Sub), 제어 명령 전달(Pub) |
| **C 구간** | **Spring 서버 ↔ DB** | **JDBC/SQL** | 수집된 데이터의 영구 저장 |
| **D 구간** | **Spring 서버 ↔ 관리자 앱** | **HTTP/REST** | 데이터 조회, 관리자 설정 변경 |

### 1 단계 : 부팅 및 하드웨어 정보 추출

- 로봇 전원이 켜지면 OS 가 로드되고 자신의 NIC 에서 고유한 MAC 주소를 읽어옴
    - ex) `00:0A:95:9D:68:16`
- 이 MAC 주소는 이 로봇의 평생 이름표가 됨
- 로봇은 통신에 사용할 topic 주소를 미리 생성
    - 상태 보고용: `airport/robots/00:0A:95:9D:68:16/status`
    - 명령 수신용: `airport/robots/00:0A:95:9D:68:16/command`

### 2단계: 브로커 연결 및 유언장 등록

- tcp 연결
    - 공항 wifi 에 접속한 후 messaage broker 의 ip 로 tcp 3-way handshake 시도
- MQTT CONNECT
    - 연결시 client id 를 자신의 mac 주소로 설정해 접속
        - 이때 유언장을 등록 (주제: `.../status`, 내용: `{"state": "DISCONNECTED"}`)
        - 브로커는 이제 이 MAC 주소의 로봇이 온라인이다라는 세션을 유지

### 3단계: 시스템 등록 및 구독

- 구독 시작
    - 로봇은 브로커에게 내 MAC 주소가 들어간 command topic 으로 오는 메시지는 다 나에게 달라고 요청함
    - (`SUBSCRIBE` -> `airport/robots/00:0A:95:9D:68:16/command`)

- 최초 등록 메시지 발생
    - 로봇이 status 토픽으로 나 부팅 완료했고 이제 일 가능하다고 메시지를 보냄 (publish)
        - **Payload:** `{"mac": "00:0A:95:9D:68:16", "model": "Cleaner-V2", "state": "READY"}`

### 4단계 : Spring 서버의 DB 처리

- 메시지 수신
    - `airport/robots/+/status`를 와일드카드로 구독하고 있다가 위 메시지를 받음
- db 확인 및 저장
    - 서버는 페이로드에서 mac 주소를 추출해 robot 테이블을 조회
        - 신규 로봇 → insert
        - 기존 로봇 → update

### 5단계: 실시간 상태 보고

- 로봇은 주기적으로 위치 좌표와 베터리 잔량을 동일한 status 토픽으로 보냄
- spring 서버는 이를 받아 db 의 robot 테이블 이를 저장

### 6단계: 사용자 요청에 의한 원격 제어

- 사용자 명령
    - 관리자가 웹 화면에서 1번로봇 B 구역 이동 명령
- spring 서버 로직
    - db 에서 해당 로봇의 mac 주소 조회
    - Mac 주소 기반으로 해당 로봇 전용 토픽으로 message 발행
        - **Topic:** `airport/robots/00:0A:95:9D:68:16/command`
        - **Payload:** `{"action": "MOVE", "x": 125, "y": 450}`
- 로봇 실행
    - 미리 자기 토픽을 구독하던 로봇은 브로커로부터 메시지를 즉시 전달 받고 바퀴를 굴려 이동

### 고려 사항

- 빈번히 변경되는 로봇의 상태를 spring 이 db 에 저장한다면?
- 로봇 상태를 업데이트하기 위한 db connection 이 자주 할당되게 됨
- 다른 사용자의 요청을 처리하는 가용 connection 수가 줄어듬
    - 히카리풀 → 10개 connection default

- redis 를 도입하면 어떨까?
    - 상태 저장소로

- 현재 로봇의 상태를 db 에 저장해두되 조회할 때는 redis 의 데이터가 조회 되게끔
- 상태유지시 ttl 만 변경
- 상태 변경시 redis 에 있는 데이터 삭제 후 db 에 update query → cache aside
- db connection 부하 막을 수 있을 거라는 생각

## 6. 다음 공부할 것

- 여러 MQ 특징 공부
    - 왜 이 기술 사용 ?
        - ex : 왜 mosquitto 사용 ?
- 실제 구현
    - 실제로 연동해보기 (spring, mosquitto, … )
- MQ 다중화
    - 공항 환경의 경우 SPOF 회피 중요
        - 클러스터링을 어떻게 할것인가? 를 알아보자.