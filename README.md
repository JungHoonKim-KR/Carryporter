# ✨ Carry Porter

<div align="center">
  
**한 걸음이 무거운 순간, 짐 걱정은 여기까지**
  
**교통 약자를 위한 호출형 짐 운반 서비스**

<img width="800" height="450" alt="image" src="https://github.com/user-attachments/assets/505a5330-5f40-41f7-aa64-03e773280b31" />

Carry Porter는 공항 내 지정된 경로(Line)를 따라 수하물을 인수·보관·반환하는 라인트레이싱 기반의 스마트 포터 시스템입니다.

**개발 기간** : 2026.01.06 ~ 2026.02.09 **(6주)**  
**플랫폼** : AIoT & Web  
**개발 인원** : 6명  
**기관** : 삼성 청년 SW·AI 아카데미 14기

</div>

---

# 🔎 목차

- [🧑‍💻 팀 구성](#-팀-구성)
- [🛠️ 기술 스택](#️-기술-스택)
- [🚀 CI/CD](#-cicd)
- [🎯 주요 기능](#-주요-기능)
- [📦 프로젝트 산출물](#-프로젝트-산출물)

---

# 🧑‍💻 팀 구성

| ![](https://github.com/user-attachments/assets/88fc8c78-a2fb-4447-b670-6b81ba2f188a) | ![](https://github.com/user-attachments/assets/8eef5d47-483e-488a-9a71-e3d517afb06f) | ![](https://github.com/user-attachments/assets/5d1b393e-fd2e-4696-af8c-f533976e1a6b) |
|:---:|:---:|:---:|
| **서기현** | **강희정** | **정승현** |
| Backend & Leader | Backend & DevOps | Backend & JiraOps |
| 대기방/초대코드 API 구현 | 인프라 및 CI/CD 파이프라인 구축 | Security, OAuth2, SMTP 인증 API |
| WebSocket/STOMP 채팅 API | OpenVidu 세션/Release API 구현 | 마이페이지/세션 락 API 구현 |
| Spring: AWS S3, MongoDB 연동 | FastAPI Webhook Handler 서버 구현 | OpenAI STT, TTS API 구현 |

| ![](https://github.com/user-attachments/assets/d7bde38e-7d53-402b-9760-0ee547c2a2fc) | ![](https://github.com/user-attachments/assets/7ce61a8b-d5a2-46db-a4da-4a0b82d76738) | ![](https://github.com/user-attachments/assets/2b2ede2c-5209-4958-9bf6-440e017d96eb) |
|:---:|:---:|:---:|
| **박승찬** | **김정훈** | **전준완** |
| Backend & AI | Frontend & Design | Frontend & Docs |
| Lip Reading 모델 학습 및 최적화 | OpenVidu 음성 연결, Signaling 채팅 | LiveRoom 오버레이 창, 단축키 매핑 |
| 구화 인식/번역/TTS 파이프라인 | STT/Lip Reading 결과 음성 세션 연동 | 공식 웹사이트 다운로드 페이지 구현 |
| FastAPI 기반 Lip Model 서버 | STOMP 기반 실시간 채팅 구현 | 로그인/회원가입/마이페이지 구현 |

---

# 🛠️ 기술 스택

### 📟 Embedded & IoT

<img src="https://img.shields.io/badge/C-A8B9CC?style=for-the-badge&logo=c&logoColor=black"> <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=FFD43B"> <img src="https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white"> <img src="https://img.shields.io/badge/Arduino%20IDE-00979D?style=for-the-badge&logo=arduino&logoColor=white"> <img src="https://img.shields.io/badge/Isaac%20SIM-76B900?style=for-the-badge&logo=nvidia&logoColor=white"> <img src="https://img.shields.io/badge/Isaac%20Lab-76B900?style=for-the-badge&logo=nvidia&logoColor=white"> <img src="https://img.shields.io/badge/ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white"> <img src="https://img.shields.io/badge/Raspberry%20Pi%205-A22846?style=for-the-badge&logo=raspberrypi&logoColor=white"> <img src="https://img.shields.io/badge/STM32-03234B?style=for-the-badge&logo=stmicroelectronics&logoColor=white"> <img src="https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white"> <img src="https://img.shields.io/badge/ROS2-22314E?style=for-the-badge&logo=ros&logoColor=white">

| 구분 | 사용 기술 |
|------|----------|
| Language | C/C++, Python |
| Development Tools | Visual Studio Code, Arduino IDE, Isaac Sim, Isaac Lab |
| Microcontroller | STM32 (Cortex-M), ESP32 (Dual-core Xtensa LX6, WiFi 802.11 b/g/n) |
| SBC | Raspberry Pi (Python 3.11, Python 3.13, Picamera2, libcamera) |
| Hardware & Robotics | DOFBOT 6-DOF Robot Arm x2, Servo Motors (ESP32Servo, PWM Control) |
| Arduino Libs | FastLED, PubSubClient, ArduinoJson, ESP32Servo |
| Python Libs | OpenCV, Arm_Lib, PySerial |
| Communication | MQTT over WiFi (JSON payload), Serial (UART/USB) |
| Features | Servo Control, LED Facial Expression, Dual Robot Arm Control, Face Tracking |

---

### 🕹️ Control Systems

<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=FFD43B"> <img src="https://img.shields.io/badge/asyncio-3776AB?style=for-the-badge&logo=python&logoColor=FFD43B"> <img src="https://img.shields.io/badge/aiomqtt-660066?style=for-the-badge&logo=mqtt&logoColor=white">

| 구분 | 사용 기술 |
|------|----------|
| PID Controller | Face Tracking Servo Control, Stable Position Control |
| Easing Functions | Smooth Motion Animation, Natural Movement |
| State Machine | JRobot Action Flow Control, Command Preemption |
| Async Processing | Python asyncio, aiomqtt, Threading, Subprocess |

---

### 🧠 AI & CV

<img src="https://img.shields.io/badge/Python%203.12-3776AB?style=for-the-badge&logo=python&logoColor=FFD43B"> <img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white"> <img src="https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white"> <img src="https://img.shields.io/badge/MediaPipe-0097A7?style=for-the-badge&logo=google&logoColor=white"> <img src="https://img.shields.io/badge/OpenAI%20Whisper-412991?style=for-the-badge&logo=openai&logoColor=white"> <img src="https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white"> <img src="https://img.shields.io/badge/RunPod-673AB7?style=for-the-badge&logo=linuxcontainers&logoColor=white">

| 구분 | 사용 기술 |
|------|----------|
| Language | Python 3.12 |
| Vision | OpenCV (cv2), MediaPipe |
| AI API | OpenAI Whisper (STT), OpenAI TTS, Porcupine (Wake Word Detection) |
| Video Processing | aiortc (WebRTC), PyAV (FFmpeg Binding) |
| Detection | Haar Cascade Face Detection, MediaPipe Face Landmarker, Gesture Recognition |
| Features | Real-time Face Tracking, Gesture Recognition, Speech-to-Text, Text-to-Speech, Wake Word Detection |
| RunPod | GPU: RTX 4500 (20GB VRAM), RAM: 54GB, CPU: 12 vCPU, SSD: 80GB |

---

### 📡 Communication Protocols

<img src="https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white"> <img src="https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white"> <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white"> <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"> <img src="https://img.shields.io/badge/OAuth%202.0-EB5424?style=for-the-badge&logo=auth0&logoColor=white">

| 구분 | 사용 기술 |
|------|----------|
| Protocols | HTTP/HTTPS, WebSocket, MQTT (QoS 0), WebRTC |
| Data Formats | JSON, Base64, JPEG, MP4/WebM |
| Security | JWT, OAuth 2.0, CORS, TLS/HTTPS |

---

### ⚡ Backend - FastAPI

<img src="https://img.shields.io/badge/Python%203.12-3776AB?style=for-the-badge&logo=python&logoColor=FFD43B"> <img src="https://img.shields.io/badge/FastAPI%200.120.3-009688?style=for-the-badge&logo=fastapi&logoColor=white"> <img src="https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white"> <img src="https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white"> <img src="https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white"> <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white"> <img src="https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white">

| 구분 | 사용 기술 |
|------|----------|
| Language | Python 3.12 |
| Framework | FastAPI 0.120.3 |
| Library | Pydantic, SQLAlchemy, PyJWT, dependency-injector, aiomqtt, boto3, OpenAI |
| Runtime | Uvicorn (ASGI Server) |
| Features | STT/TTS (OpenAI Whisper), MQTT Messaging, S3 File Management, JWT Auth |

---

### 🍃 Backend - Spring Boot

<img src="https://img.shields.io/badge/Java%2017-007396?style=for-the-badge&logo=openjdk&logoColor=white"> <img src="https://img.shields.io/badge/Spring%20Boot%203.5.6-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"> <img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white"> <img src="https://img.shields.io/badge/Spring%20Data%20JPA-6DB33F?style=for-the-badge&logo=spring&logoColor=white"> <img src="https://img.shields.io/badge/OAuth2-EB5424?style=for-the-badge&logo=auth0&logoColor=white"> <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"> <img src="https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white">

| 구분 | 사용 기술 |
|------|----------|
| Language | Java 17 |
| IDE | IntelliJ IDEA 2025.2.4 (Ultimate Edition) |
| Framework | Spring Boot 3.5.6 |
| Library | Spring Security, Spring Data JPA, OAuth2, JWT |
| Build Tool | Gradle |
| Feature | Member Management, OAuth2 Social Login, Channel & Media Management, JWT Auth |

---

### 💾 Database & Storage

<img src="https://img.shields.io/badge/MySQL%208.4.6-4479A1?style=for-the-badge&logo=mysql&logoColor=white"> <img src="https://img.shields.io/badge/Redis%207.4.5-DC382D?style=for-the-badge&logo=redis&logoColor=white"> <img src="https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white">

| 구분 | 사용 기술 |
|------|----------|
| RDBMS | MySQL 8.4.6 |
| Cache | Redis 7.4.5 (jemalloc-5.3.0) |
| Storage | AWS S3 |

---

### 🖥️ Frontend

<img src="https://img.shields.io/badge/TypeScript%20v5-3178C6?style=for-the-badge&logo=typescript&logoColor=white"> <img src="https://img.shields.io/badge/Node.js%20v22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"> <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"> <img src="https://img.shields.io/badge/Vite%20v5-646CFF?style=for-the-badge&logo=vite&logoColor=white"> <img src="https://img.shields.io/badge/Tailwind%20CSS%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"> <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white"> <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white">

| 구분 | 사용 기술 |
|------|----------|
| Language | TypeScript v5 |
| Runtime Environment | Node.js v22 |
| Framework | React v18/19 |
| Library | React Router DOM, React Three Fiber, @react-three/drei, MQTT.js, @stomp/stompjs, Axios, JWT-decode |
| Build Tool | Vite v5 |
| Styling | TailwindCSS v4 |
| 3D Graphics | Three.js, React Three Fiber, Postprocessing |
| PWA | vite-plugin-pwa, Workbox |
| Features | Mobile PWA App, 3D Robot Visualization Dashboard, Real-time MQTT/WebSocket Communication |

---

### ♾️ DevOps & Infra

<img src="https://img.shields.io/badge/Ubuntu%2022.04-E95420?style=for-the-badge&logo=ubuntu&logoColor=white"> <img src="https://img.shields.io/badge/Docker%20v28.5.1-2496ED?style=for-the-badge&logo=docker&logoColor=white"> <img src="https://img.shields.io/badge/Docker%20Compose%20v2.40.2-2496ED?style=for-the-badge&logo=docker&logoColor=white"> <img src="https://img.shields.io/badge/Jenkins%202.528.1-D24939?style=for-the-badge&logo=jenkins&logoColor=white"> <img src="https://img.shields.io/badge/Nginx%201.27-009639?style=for-the-badge&logo=nginx&logoColor=white"> <img src="https://img.shields.io/badge/AWS%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white">

| 구분 | 사용 기술 |
|------|----------|
| Instance Type | T2.XLARGE |
| CPU | 4 vCPUs |
| RAM | 16GB |
| Storage (Disk) | SSD: 310GB |
| OS | Ubuntu 22.04.5 LTS |
| Kernel | Linux 6.8.0-1040-aws x86_64 |
| Docker | v28.5.1 |
| Docker Compose | v2.40.2 |
| Jenkins | 2.528.1 |
| Nginx | nginx/1.27 |

---

# 🚀 CI/CD

> 내용을 채워주세요

---

# 🎯 주요 기능

사용자 gif

관리자 gif

---

# 🌐 아키텍처 구조

<img width="1632" height="903" alt="image" src="https://github.com/user-attachments/assets/68711a4a-5284-4aa0-a659-c42a7f39b2eb" />

---

# 📁 프로젝트 디렉토리 구조

<details>
<summary>🖥️ Frontend (User)</summary>

```
src/
│  App.tsx
│  index.css
│  main.tsx
│  vite-env.d.ts
│
├─api/
│      auth.api.ts
│      axios.ts
│      locker.api.ts
│      mission.api.ts
│      ticket.api.ts
│
├─assets/
│  └─fonts/
│          beckman-free.otf
│
├─components/
│  ├─auth/
│  │      LoginForm.tsx
│  │      PasswordInputField.tsx
│  │      TermsCheckbox.tsx
│  │
│  ├─common/
│  │      Logo.tsx
│  │      SSEProvider.tsx
│  │
│  ├─features/
│  │  └─mission/
│  │          ConnectionStatusBadge.tsx
│  │          MissionModals.tsx
│  │          MissionTimeline.tsx
│  │          RobotInfoCard.tsx
│  │
│  ├─home/
│  │      LockerStatusCard.tsx
│  │      RobotCallCard.tsx
│  │      RobotStatusCard.tsx
│  │      TicketSection.tsx
│  │      WelcomeSection.tsx
│  │
│  ├─layouts/
│  │      AppHeader.tsx
│  │
│  ├─mission/
│  │      ChecklistModal.tsx
│  │      CompleteModal.tsx
│  │      LocationSelector.tsx
│  │      MissionSummaryCard.tsx
│  │      NumpadKeyboard.tsx
│  │      ProgressBar.tsx
│  │      ReturningModal.tsx
│  │      TimelineStep.tsx
│  │      VerificationModal.tsx
│  │
│  ├─ticket/
│  │      CameraErrorView.tsx
│  │      ScanSuccessModal.tsx
│  │      TicketCard.tsx
│  │      WebcamScanner.tsx
│  │
│  └─ui/
│          badge.tsx / button.tsx / card.tsx
│          checkbox.tsx / input.tsx / tabs.tsx
│
├─constants/
│      locations.ts
│
├─domain/
│  └─mission/
│          stateMachine.ts
│
├─hooks/
│      useChecklistFlow.ts / useGlobalSSE.ts
│      useLockerData.ts / useLoginForm.ts
│      useMissionCreate.ts / useMissionFlow.ts
│      useSessionRestore.ts / useTicketData.ts / useTiltEffect.ts
│
├─lib/
│      utils.ts
│
├─pages/
│      CodeVerificationPage.tsx / HomePage.tsx
│      LoginPage.tsx / MissionCreatePage.tsx
│      MissionTrackPage.tsx / SplashPage.tsx
│      TicketDetailPage.tsx / TicketScanPage.tsx
│
├─routes/
│      index.tsx / ProtectedRoute.tsx
│
├─services/
│  └─storage/
│          ticketStorage.ts
│
├─store/
│      authStore.ts / missionStore.ts
│      sseStore.ts / ticketStore.ts
│
├─types/
│      auth.types.ts / locker.types.ts
│      mission.types.ts / ticket.types.ts
│
└─utils/
        array.ts / imageUtils.ts / validation.ts
```

</details>

<details>
<summary>🛠️ Frontend (Admin)</summary>

```
src/
│  App.tsx
│  index.css
│  main.tsx
│  vite-env.d.ts
│
├─api/
│      authApi.ts / axiosConfig.ts
│
├─components/
│  ├─dashboard/
│  │      ActiveTaskList.tsx / AssignToLockerModal.tsx
│  │      DashboardWidgets.tsx / LockerManagementModal.tsx
│  │      MapView.tsx / RobotDetailsPanel.tsx
│  │      StatCard.tsx / StatusCard.tsx
│  │
│  ├─layout/
│  │      MainLayout.tsx / Sidebar.tsx
│  │
│  ├─locker/
│  │      LockerSelectionModal.tsx / MiniLockerWidget.tsx
│  │
│  ├─mission/
│  │      MissionControlModal.tsx / MissionProcessModal.tsx / MissionReturnModal.tsx
│  │
│  ├─monitoring/
│  │      RealtimeActivityFeed.tsx
│  │
│  └─robot/
│          RobotActivityTerminal.tsx / RobotDetailModal.tsx
│          RobotReturnModal.tsx / RobotStage.tsx
│
├─hooks/
│      useRobotFetch.ts / UserRobotSSE.ts
│
├─lib/
│      utils.ts
│
├─pages/
│      AlertPage.tsx / JoinPage.tsx / LockersPage.tsx
│      LoginPage.tsx / RobotsPage.tsx
│
├─store/
│      lockerStore.ts / robotStore.ts
│      sseStore.ts / themeStore.ts
│
├─types/
│      auth.ts / locker.ts / robotEvents.ts
│
└─utils/
        navigationPaths.ts
```

</details>

<details>
<summary>☕ Backend</summary>

```
src/
├─main/
│  ├─java/com/e101/carryporter/
│  │  │  CarryporterApplication.java
│  │  │
│  │  ├─domain/
│  │  │  ├─admin/
│  │  │  │  ├─controller/       AdminController.java
│  │  │  │  ├─dto/request/      DispatchRequestDto / FinalizeRequestDto
│  │  │  │  │                   JoinRequestDto / LockRequestDto / LoginRequestDto
│  │  │  │  ├─dto/response/     LockerResponseDto / MissionResponseDto / RobotResponseDto
│  │  │  │  ├─entity/           AdminCredential.java
│  │  │  │  ├─event/            AdminLockRequestEvent / AdminUnlockRequestEvent
│  │  │  │  ├─repository/       AdminCredentialRepository.java
│  │  │  │  └─service/          AdminLockerService / AdminService
│  │  │  │
│  │  │  ├─auth/
│  │  │  │  ├─controller/       AuthController.java
│  │  │  │  ├─dto/request/      AuthRequestDto / LockRequestDto
│  │  │  │  │                   VerifyCodeRequestDto / VerifyPasswordRequestDto
│  │  │  │  ├─dto/response/     AuthResponseDto / TokenResponseDto
│  │  │  │  ├─repository/       EmailCodeRedisRepository / LoginFailCountRedisRepository
│  │  │  │  │                   RefreshTokenRedisRepository / TempPasswordRedisRepository
│  │  │  │  └─service/          AuthService.java
│  │  │  │
│  │  │  ├─location/
│  │  │  │  ├─entity/           Location.java
│  │  │  │  ├─exception/        LocationErrorCode.java
│  │  │  │  ├─repository/       LocationRepository.java
│  │  │  │  └─service/          LocationService.java
│  │  │  │
│  │  │  ├─locker/
│  │  │  │  ├─entity/           Locker / LockerStatus / UserLockerStatus
│  │  │  │  ├─exception/        LockerErrorCode.java
│  │  │  │  ├─repository/       LockerRepository.java
│  │  │  │  └─service/          LockerService.java
│  │  │  │
│  │  │  ├─mission/
│  │  │  │  ├─controller/       MissionController.java
│  │  │  │  ├─entity/           Mission / MissionStatus
│  │  │  │  ├─event/            MissionAbortedEvent / MissionCreatedEvent
│  │  │  │  │                   MissionFailedEvent / MissionFinalizedEvent
│  │  │  │  │                   MissionLockedEvent / MissionStartedEvent
│  │  │  │  │                   MissionStoredEvent / MissionUnlockedEvent
│  │  │  │  ├─exception/        MissionErrorCode.java
│  │  │  │  ├─listener/         FailureCountHandler / MissionStatusHandler
│  │  │  │  ├─repository/       MissionRepository.java
│  │  │  │  └─service/          MissionService.java
│  │  │  │
│  │  │  ├─robot/
│  │  │  │  ├─entity/           Robot / RobotRealTimeInfo / RobotStatus
│  │  │  │  ├─event/            RobotArrivalEvent / RobotAssignedEvent
│  │  │  │  │                   RobotAvailabilityChangedEvent / RobotEmergencyEvent
│  │  │  │  │                   RobotLogEvent / RobotReturnedEvent
│  │  │  │  ├─exception/        RobotErrorCode.java
│  │  │  │  ├─listener/         RobotAssignmentHandler / RobotRedisSyncHandler
│  │  │  │  ├─repository/       RobotAvailableQueueRepository / RobotMacMappingRepository
│  │  │  │  │                   RobotRealTimeRepository / RobotRepository
│  │  │  │  └─service/          RobotCacheService / RobotService
│  │  │  │
│  │  │  ├─sse/
│  │  │  │  ├─controller/       SseController / SseTestController
│  │  │  │  ├─listener/         AdminSseNotificationHandler / UserSseNotificationHandler
│  │  │  │  ├─repository/       SseEmitterRepository.java
│  │  │  │  └─service/          SseService.java
│  │  │  │
│  │  │  ├─ticket/
│  │  │  │  ├─controller/       TicketController.java
│  │  │  │  ├─entity/           Ticket.java
│  │  │  │  ├─repository/       TicketRepository.java
│  │  │  │  └─service/          OcrClient / TicketService
│  │  │  │
│  │  │  └─user/
│  │  │      ├─controller/      UserController.java
│  │  │      ├─entity/          Role / User
│  │  │      ├─event/           UserAuthFailedEvent / UserAuthSuccessEvent
│  │  │      ├─exception/       UserErrorCode.java
│  │  │      ├─repository/      UserRepository.java
│  │  │      └─service/         UserService.java
│  │  │
│  │  └─global/
│  │      ├─config/             AsyncConfig / JpaConfig / MqttConfig
│  │      │                     RedisConfig / RetryConfig / WebConfig
│  │      ├─entity/             BaseEntity.java
│  │      ├─exception/          BusinessException / ControllerAdvice
│  │      │                     ErrorCode / ErrorResponse
│  │      ├─filter/             AuthorizationFilter / CorsFilter / JwtAuthenticationFilter
│  │      ├─listener/           MqttCommandHandler.java
│  │      ├─service/mqtt/       MqttPublisherService / MqttSubscriberService
│  │      └─utils/              JwtUtils / MattermostClient
│  │
│  └─resources/
│          application.yml / application-test.yml
│
└─test/
    └─java/com/e101/carryporter/
        ├─domain/
        │  ├─admin/     AdminControllerTest / AdminServiceTest
        │  ├─auth/      AuthControllerTest / AuthServiceTest
        │  ├─location/  LocationServiceTest
        │  ├─locker/    LockerServiceTest
        │  ├─mission/   MissionControllerTest / MissionServiceTest
        │  ├─robot/     RobotServiceTest
        │  ├─sse/       SseControllerTest / SseServiceTest
        │  ├─ticket/    TicketControllerTest
        │  └─user/      UserControllerTest / UserServiceTest
        ├─global/
        │  ├─listener/  MqttCommandHandlerTest
        │  ├─service/   MqttPublisherServiceTest / MqttSubscriberServiceTest
        │  └─utils/     JwtUtilsTest / MattermostClientTest
        └─support/
                IntegrationTestSupport.java / WebMvcTestSupport.java
```

</details>

---

# 📦 프로젝트 산출물

**📹 Video Portfolio**

- [carryporter_14기 공통PJT 영상 포트폴리오 E101](https://youtu.be/zutxE7PEOgU)
- [공통PJT_carryporter발표](https://youtu.be/zutxE7PEOgU)
- [carryporter_기획배경(AI)](https://youtu.be/Lsbg-lAFVb0)
- [carryporter_교통약자시연영상(in SSAFY)](https://youtu.be/EMQk7KcneSM)

---

**🖼️ 화면 설계서**

<details>
<summary>자세히</summary>

피그마 - 와이어 프레임, 목업

</details>
---

**🗄️ ERD**

<details>
<summary>자세히</summary>
  
<img width="1850" height="1042" alt="ERD" src="https://github.com/user-attachments/assets/f2377254-f759-400f-a894-025a2eb07652" />

</details>
---

**📅 Jira Issues**

<details>
<summary>자세히</summary>

> 이미지를 추가해주세요

</details>

---

**📋 기능 명세서**

<details>
<summary>자세히</summary>

<img width="1119" height="932" alt="image" src="https://github.com/user-attachments/assets/e784fa05-6fcc-43a5-86f1-31f731841b5f" />

</details>

---

**📡 API 명세서**

<details>
<summary>자세히</summary>

<img width="638" height="1124" alt="image" src="https://github.com/user-attachments/assets/f013ca36-4add-4508-b0d3-1ded6342a39a" />

</details>
