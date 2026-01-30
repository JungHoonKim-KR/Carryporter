# 🚀 CARRY PORTER

> 교통 약자를 위한 호출형 짐 운반 서비스
> React 19 + TypeScript + Tailwind CSS v4 기반 반응형 웹 애플리케이션

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.18-38B2AC?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite)

---

## 📖 프로젝트 소개

CARRY PORTER는 공항에서 교통 약자가 자율주행 로봇을 통해 짐을 보관하고 운반할 수 있는 혁신적인 서비스입니다.

### 주요 기능

- ✅ **2단계 간편 인증** (Mattermost 기반)
- ✅ **실시간 로봇 추적** (SSE)
- ✅ **OCR 티켓 스캔**
- ✅ **로봇 호출 및 미션 관리**
- ✅ **보관/반납 플로우**
- ✅ **Tailwind CSS v4 반응형 UI**
- ✅ **shadcn/ui 컴포넌트 시스템**
- ⏳ **관리자 대시보드**

---

## 🎯 빠른 시작

### 필수 조건

- Node.js 18.0.0 이상
- npm 9.0.0 이상

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone <repository-url>
cd frontend

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 접속
# http://localhost:3000 (포트 변경됨: 백엔드 CORS 설정 맞춤)
```

### 빌드

```bash
# Production 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── api/              # API 통신 레이어
│   ├── components/       # 재사용 컴포넌트
│   │   ├── common/      # Button, Input 등
│   │   └── layouts/     # 레이아웃 컴포넌트
│   ├── hooks/           # 커스텀 훅
│   ├── pages/           # 페이지 컴포넌트
│   ├── routes/          # 라우팅 설정
│   ├── store/           # Zustand 상태 관리
│   ├── types/           # TypeScript 타입
│   └── utils/           # 유틸리티 함수
├── docs/                # 📚 문서
│   ├── DEVELOPMENT_GUIDE.md   # 개발 가이드
│   ├── CODE_REFERENCE.md      # 코드 레퍼런스
│   ├── TECH_STACK.md          # 기술 스택 설명
│   ├── requirements.md        # 요구사항 명세
│   └── api-spec.md            # API 명세
└── public/              # 정적 파일
```

---

## 🛠️ 기술 스택

### Core
- **React** 19.2.0 - 최신 UI 라이브러리
- **TypeScript** 5.9.3 - 타입 안전성 (strict 모드)
- **Vite** 7.2.4 - 초고속 빌드 도구
- **Tailwind CSS** 4.1.18 - 유틸리티 우선 CSS (v4 최신 버전)

### UI Components
- **shadcn/ui** - Radix UI 기반 접근성 높은 컴포넌트 시스템
  - Dialog, Button, Card, Input 등 포함
  - 복사-붙여넣기 방식으로 소스 코드 직접 소유
- **Radix UI** - 헤드리스 UI 컴포넌트
- **class-variance-authority** - 컴포넌트 variant 관리

### State Management
- **Zustand** 5.0.10 - 간단한 전역 상태 관리 (4개 Store: auth, ticket, mission, admin)

### Routing
- **React Router** 7.13.0 - 클라이언트 사이드 라우팅 (Protected Routes 포함)

### API & Data
- **Axios** 1.13.2 - HTTP 클라이언트 (Interceptor로 자동 토큰 갱신)
- **React Query** 5.90.20 - 서버 상태 관리

### Forms & Validation
- **React Hook Form** 7.71.1 - 성능 최적화된 폼 관리
- **Zod** 4.3.6 - TypeScript 스키마 검증
- **@hookform/resolvers** - Zod와 React Hook Form 통합

### Media & OCR
- **react-webcam** 7.2.0 - 웹캠 제어 (티켓 스캔 기능)

---

## 📚 문서

프로젝트의 모든 문서는 [`docs/`](./docs/) 폴더에 있습니다:

| 문서 | 설명 |
|------|------|
| [DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md) | 개발 시작 가이드, 새 컴퓨터 설정 방법 |
| [CODE_REFERENCE.md](./docs/CODE_REFERENCE.md) | 모든 함수, 컴포넌트, 타입 상세 설명 |
| [TECH_STACK.md](./docs/TECH_STACK.md) | 기술 스택 선택 이유와 비교 |
| [requirements.md](./docs/requirements.md) | 요구사항 명세서 |
| [api-spec.md](./docs/api-spec.md) | API 명세서 |

---

## 🎨 주요 화면

### 1. 스플래시 화면
- CARRY PORTER 로고
- 로봇 일러스트
- 자동 전환 (3초)

### 2. 로그인 화면
- Mattermost 이메일 입력
- 비밀번호 + 비밀번호 확인
- 약관 동의

### 3. PIN 인증 화면
- 3개 PIN 번호 선택
- Mattermost로 전송된 번호 확인

### 4. 홈 화면
- 사용자 정보 표시
- 로그아웃 기능

---

## 🔐 보안

- **Access Token**: Zustand Store (메모리)에만 저장 (XSS 방지)
- **Refresh Token**: httpOnly 쿠키로 관리 (백엔드에서 Set-Cookie)
- **자동 토큰 갱신**: axios interceptor로 401 에러 시 자동 재발급
- **withCredentials**: true로 쿠키 자동 전송
- **HTTPS**: Production 환경에서 사용
- **비밀번호**: 서버 측 AES256 암호화
- **인증 플로우**: 2단계 (Email + Password → PIN 인증)

---

## 🧪 테스트 (추후 구현)

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 커버리지
npm run test:coverage
```

---

## 🚀 배포 (추후 구현)

```bash
# 환경 변수 설정
cp .env.example .env.production

# 빌드
npm run build

# Vercel, Netlify, CloudFlare Pages 등에 배포
```

---

## 📝 개발 가이드

### 새 페이지 추가

1. `src/pages/NewPage.tsx` 생성
2. `src/routes/index.tsx`에 라우트 추가
3. 필요시 타입 정의 (`src/types/`)

### 새 API 추가

1. `src/types/`에 타입 정의
2. `src/api/`에 API 함수 작성
3. 컴포넌트에서 사용

### 새 컴포넌트 추가

1. `src/components/common/` 또는 해당 폴더에 생성
2. Props 인터페이스 정의
3. TypeScript로 타입 안전하게 작성

자세한 내용은 [DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md)를 참조하세요.

---

## 🐛 트러블슈팅

### 서버가 시작되지 않음
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tailwind 스타일이 적용 안 됨
- `index.css`에 `@import "tailwindcss";` 확인
- `postcss.config.js`에 `@tailwindcss/postcss` 확인
- 서버 재시작

### CORS 에러
- 백엔드에서 CORS 설정 필요
- `.env.development`의 API URL 확인

자세한 내용은 [DEVELOPMENT_GUIDE.md - 트러블슈팅](./docs/DEVELOPMENT_GUIDE.md#트러블슈팅)을 참조하세요.

---

## 🤝 기여 가이드 (추후 작성)

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

This project is licensed under the MIT License.

---

## 👥 팀

- **프론트엔드**: CARRY PORTER Team
- **백엔드**: Spring Boot + FastAPI
- **로봇**: Raspberry Pi + Jetson Nano

---

## 📞 문의

- 이슈: [GitHub Issues](https://github.com/your-org/carry-porter/issues)
- 이메일: support@carryporter.com

---

## 🌟 감사의 말

이 프로젝트는 교통 약자의 공항 이용 편의성 향상을 위해 만들어졌습니다.

**Made with ❤️ by CARRY PORTER Team**

---

## 📌 체크리스트

### 완료된 기능 ✅
- ✅ 프로젝트 초기화 (Vite + React + TypeScript)
- ✅ Tailwind CSS v4 + shadcn/ui 설정
- ✅ 인증 시스템 (Zustand + JWT)
- ✅ API 레이어 (Axios + Interceptor + Proxy)
- ✅ 로그인/PIN 인증
- ✅ Protected Route
- ✅ 홈 화면
- ✅ 티켓 스캔 기능 (OCR)
- ✅ 로봇 호출 기능 (미션 생성)
- ✅ 실시간 추적 (SSE)
- ✅ 보관/반납 플로우
- ✅ 4자리 PIN 인증 모달
- ✅ 무게 측정 애니메이션

### 진행 중 ⏳
- ⏳ 관리자 대시보드
- ⏳ 프로덕션 배포 설정

### 계획 📋
- 📋 E2E 테스트 (Playwright)
- 📋 성능 최적화
- 📋 PWA 지원
- 📋 CI/CD 구축

---

---

## 🌐 환경 설정

### 환경 변수

**개발 환경** (`.env.development`):
```bash
# Vite 프록시 사용으로 baseURL은 빈 문자열
# vite.config.ts에서 /api, /ocr 경로를 프록시 설정
```

**프로덕션 환경**:
```bash
VITE_API_BASE_URL=https://i14e101.p.ssafy.io
```

### 개발 서버 포트

- **포트**: 3000 (백엔드 CORS 설정에 맞춤)
- **프록시**: `/api`, `/ocr` 경로는 `https://i14e101.p.ssafy.io`로 자동 프록시

---

## 🎯 핵심 아키텍처

### 상태 관리 (Zustand)
- **authStore**: Access Token, 사용자 정보
- **ticketStore**: 티켓 정보 (OCR 결과)
- **missionStore**: 미션 상태, SSE 연결, 보관된 짐 목록

### API 레이어
- **axios.ts**: HTTP 클라이언트 + Interceptor (자동 토큰 갱신)
- **auth.api.ts**: 인증 API
- **ticket.api.ts**: 티켓 스캔 API
- **mission.api.ts**: 미션 관리 API + SSE 구독

### 실시간 통신 (SSE)
- **EventSource** 사용
- **useMissionSSE** 훅으로 추상화
- Cleanup 함수로 메모리 누수 방지

---

**최종 업데이트**: 2026년 1월 30일
**구현 진행률**: 90% (미션 시스템 완료)
**개발 포트**: 3000번 (CORS 설정 맞춤)
