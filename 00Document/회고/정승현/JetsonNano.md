# Jetson Orin Nano

## **1. 학습 개요**

---

- **주제: Jetson Orin Nano**
- **목표: 정보 공유**

## **2. 핵심 내용**

---

[초기 환경 세팅](https://www.notion.so/2ed96aba58cc8027951cca13b55e88a9?pvs=21)

- Jetson Orin Nano 환경 정보
    
    <aside>
    💡 1. H/W
    - 젯슨 오린 나노 보드 Jetpack 6.2
    - USB 카메라
    
    2. SW
    - Opencv : 4.10.0 (CUDA 활성화 버전)
    - pytorch : 2.3.0 (명세서 2.6.0)
    - torchvision : 0.18.0 (명세서 0.21.0)
    - ultralytics : (명세서 8.2.84)
    - numpy : 1.26.4
    
    </aside>
    

[젯슨오린나노 원격접속](https://www.notion.so/2ed96aba58cc801aadeae34d424a6afa?pvs=21)

## **3. 프로젝트 적용**

---

**프로젝트에 적용할 부분**

- 서버와 통신 → MQTT 브로커 : Mosquitto 무료 -> 서버에 설치
- 라이다 + 카메라로 SLAM + AMCL + Nav2 구현 : 비콘없이 가능
    - SLAM : Cartographer (초기 맵핑 -> .pgm 이나 .yaml로 저장)
    - AMCL : 라이다로 맵 매칭 후 현재 위치 추정 (파티클 필터)
    - Nav2 : 경로 계획 + 장애물 회피하며 이동
- 3D 시각화 웹이 띄우기
    - Foxglove Studio (웹 기반 ROS2 시각화 도구)
    -> 설치 없이 브라우저에서 접속 가능
    2D 맵, 3D 포인트 클라우드, 로봇 모델 모두 표시 가능

**구현 계획**

- **담당자: 정승현**
- **적용 일정: ASAP**

## **4. 팀 공유**

---

**팀원들에게 전달할 내용**

- 젯슨나노 계정 id : e101
- 젯슨나노 계정 pw : AIOT123!

**함께 해볼 것들**

- SLAM
- 자율주행

## **5. 참고 자료**

---

- https://developer.nvidia.com/isaac/ros
    - Issac for mobility 가이드가 있음.

<aside>
💡

JetPack 6.0 + CUDA 12.4용 PyTorch 2.3.0
노트북 브라우저에서 이 링크들을 직접 다운로드하세요:
PyTorch 2.3.0:
[https://nvidia.box.com/shared/static/zvultzsmd4iuheykxy17s4l2n91ylpl8.whl](https://nvidia.box.com/shared/static/zvultzsmd4iuheykxy17s4l2n91ylpl8.whl)
torchvision 0.18.0:
[https://nvidia.box.com/shared/static/u0ziu01c0kyji4zz3gxam79181nebylf.whl](https://nvidia.box.com/shared/static/u0ziu01c0kyji4zz3gxam79181nebylf.whl)
torchaudio 2.3.0:
[https://nvidia.box.com/shared/static/9si945yrzesspmg9up4ys380lqxjylc3.whl](https://nvidia.box.com/shared/static/9si945yrzesspmg9up4ys380lqxjylc3.whl)

</aside>