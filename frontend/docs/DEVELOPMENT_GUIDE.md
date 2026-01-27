# CARRY PORTER 프론트엔드 개발 가이드

> **교통 약자를 위한 호출형 짐 운반 서비스**
> React 19 + TypeScript + Tailwind CSS v4 기반 반응형 웹 애플리케이션

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [새 컴퓨터에서 시작하기](#새-컴퓨터에서-시작하기)
4. [프로젝트 구조](#프로젝트-구조)
5. [핵심 개념 설명](#핵심-개념-설명)
6. [코드 상세 분석](#코드-상세-분석)
7. [개발 가이드](#개발-가이드)
8. [트러블슈팅](#트러블슈팅)

---

## 프로젝트 개요

### 서비스 설명
CARRY PORTER는 공항에서 교통 약자가 짐을 자율주행 로봇을 통해 보관하고 운반할 수 있는 서비스입니다.

### 주요 기능
1. **Mattermost 간편 인증** (2단계)
   - 이메일 + 비밀번호 입력
   - Mattermost로 전송된 PIN 번호 선택
2. **관리자 로그인** (Username/Password)
3. **실시간 로봇 추적** (SSE - 추후 구현)
4. **티켓 스캔** (OCR - 추후 구현)
5. **짐 관리** (추후 구현)

### 현재 구현 범위
✅ 로그인 기능 (사용자/관리자)
⏳ 티켓 스캔
⏳ 로봇 호출
⏳ 실시간 상태 확인

---

## 기술 스택

### 최신 버전 사용 (2026년 1월 기준)

| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 19.2.0 | UI 라이브러리 (최신!) |
| **TypeScript** | 5.9.3 | 타입 안전성 |
| **Vite** | 7.3.1 | 빌드 도구 (최신!) |
| **Tailwind CSS** | 4.1.18 | 스타일링 (최신 v4!) |
| **React Router** | 7.13.0 | 라우팅 |
| **Zustand** | 5.0.10 | 상태 관리 |
| **Axios** | 1.13.2 | HTTP 클라이언트 |
| **React Query** | 5.90.20 | 서버 상태 관리 |
| **React Hook Form** | 7.71.1 | 폼 관리 |
| **Zod** | 4.3.6 | 스키마 검증 |

### 왜 이 기술들을 선택했나?

**React 19**
- 최신 기능: Server Components, Actions, Document Metadata
- 성능 개선: 자동 메모이제이션, 최적화된 렌더링
- 안정성: LTS(Long Term Support) 버전

**Vite 7**
- 초고속 HMR (Hot Module Replacement)
- 최적화된 번들링
- TypeScript 기본 지원

**Tailwind CSS v4**
- CSS 파일 기반 설정 (더 간단해짐)
- 성능 향상 (50% 빠른 빌드)
- 더 작은 번들 크기

**Zustand**
- Redux보다 간단한 API (보일러플레이트 최소화)
- 작은 번들 크기 (1KB)
- TypeScript 완벽 지원

---

## 새 컴퓨터에서 시작하기

### 필수 조건
- **Node.js**: 18.0.0 이상 (권장: 20.x LTS)
- **npm**: 9.0.0 이상
- **Git**: 최신 버전

### 1단계: 프로젝트 클론

```bash
# GitHub에서 클론 (repository URL은 실제 주소로 변경)
git clone https://github.com/your-org/carry-porter-frontend.git
cd carry-porter-frontend
```

### 2단계: 의존성 설치

```bash
npm install
```

**설치되는 패키지들**:
- React 및 기본 라이브러리
- 라우팅, 상태관리, HTTP 클라이언트
- 폼 관리, 스타일링 도구
- TypeScript 타입 정의

**소요 시간**: 약 1-2분

### 3단계: 환경 변수 설정

`.env.development` 파일 확인:
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_ENV=development
```

**주의**: `.env.development`는 이미 프로젝트에 포함되어 있습니다.

### 4단계: 개발 서버 실행

```bash
npm run dev
```

**결과**:
```
VITE v7.3.1  ready in 622 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

브라우저에서 `http://localhost:5173` 접속!

### 5단계: 백엔드 서버 실행 (선택)

로그인 기능을 테스트하려면 백엔드 서버가 필요합니다:
- Spring Boot: `http://localhost:8080`
- FastAPI: 해당 포트

---

## 프로젝트 구조

```
frontend/
├── public/                    # 정적 파일
│   └── assets/               # 이미지, 아이콘
├── src/
│   ├── api/                  # 🔥 API 통신 레이어
│   │   ├── axios.ts         # Axios 인스턴스 + 인터셉터
│   │   └── auth.api.ts      # 인증 API 함수들
│   │
│   ├── components/           # 🧩 재사용 컴포넌트
│   │   ├── common/          # 공통 UI 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Checkbox.tsx
│   │   └── layouts/         # 레이아웃 컴포넌트
│   │       └── AuthLayout.tsx
│   │
│   ├── hooks/                # 🎣 커스텀 훅
│   │   └── useAuth.ts       # 인증 관련 훅
│   │
│   ├── pages/                # 📄 페이지 컴포넌트
│   │   ├── SplashPage.tsx   # 스플래시 화면
│   │   ├── LoginPage.tsx    # 로그인 화면
│   │   ├── PinVerificationPage.tsx  # PIN 인증
│   │   └── HomePage.tsx     # 홈 (로그인 후)
│   │
│   ├── routes/               # 🛣️ 라우팅 설정
│   │   ├── index.tsx        # 라우트 정의
│   │   └── ProtectedRoute.tsx  # 인증 필요 라우트
│   │
│   ├── store/                # 🏪 전역 상태 관리
│   │   └── authStore.ts     # Zustand 인증 스토어
│   │
│   ├── types/                # 📝 TypeScript 타입
│   │   └── auth.types.ts    # 인증 관련 타입
│   │
│   ├── utils/                # 🛠️ 유틸리티 함수
│   │   └── validation.ts    # Zod 검증 스키마
│   │
│   ├── App.tsx              # 앱 최상위 컴포넌트
│   ├── main.tsx             # 앱 진입점
│   └── index.css            # Tailwind CSS 설정
│
├── docs/                     # 📚 문서
│   ├── requirements.md      # 요구사항 명세
│   ├── api-spec.md          # API 명세
│   └── design/              # 디자인 파일
│
├── .env.development          # 개발 환경 변수
├── package.json             # 프로젝트 설정
├── tsconfig.json            # TypeScript 설정
├── postcss.config.js        # PostCSS 설정
└── vite.config.ts           # Vite 설정
```

---

## 핵심 개념 설명

### 1. React 컴포넌트란?

**쉬운 설명**: 레고 블록처럼 조립 가능한 UI 조각

```tsx
// 예시: Button 컴포넌트
function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className="bg-blue-600 text-white px-4 py-2">
      {children}
    </button>
  );
}

// 사용
<Button onClick={() => alert('클릭!')}>로그인</Button>
```

**핵심**:
- **재사용 가능**: 한 번 만들면 여러 곳에서 사용
- **독립적**: 각 컴포넌트는 자신의 로직과 스타일 보유
- **조합 가능**: 작은 컴포넌트를 조합해 큰 화면 구성

### 2. TypeScript 타입이란?

**쉬운 설명**: 데이터의 "청사진" 또는 "계약서"

```typescript
// 사용자 타입 정의
interface User {
  id: string;
  email: string;
  name?: string;  // ? = 선택적 (없어도 됨)
}

// 사용
const user: User = {
  id: "123",
  email: "user@example.com"
  // name은 없어도 OK
};
```

**장점**:
- 컴파일 시점에 에러 발견 (런타임 전에!)
- 자동완성 제공 (개발 속도 UP)
- 코드 문서화 효과

### 3. Zustand 상태 관리란?

**쉬운 설명**: 앱 전체에서 공유하는 "메모리 창고"

```typescript
// 스토어 생성
const useAuthStore = create((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// 컴포넌트에서 사용
function Profile() {
  const user = useAuthStore((state) => state.user);
  return <div>{user?.email}</div>;
}
```

**왜 필요한가?**:
- **Props Drilling 방지**: 부모→자식→손자로 데이터 전달할 필요 없음
- **전역 상태**: 로그인 정보를 모든 페이지에서 접근
- **간단한 API**: Redux보다 훨씬 쉬움

### 4. React Router란?

**쉬운 설명**: 웹사이트의 "내비게이션 시스템"

```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<HomePage />} />
</Routes>
```

**동작 원리**:
- URL 변경 → 해당 컴포넌트 렌더링
- `/login` → LoginPage 표시
- `/` → HomePage 표시

### 5. Axios + Interceptor란?

**쉬운 설명**: 백엔드와 통신하는 "우편 배달부" + "검문소"

```typescript
// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
});

// Request Interceptor: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 401 에러 시 로그아웃
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);
```

**장점**:
- 모든 API 호출에 토큰 자동 추가 (수동으로 매번 추가 불필요)
- 인증 만료 시 자동 처리

### 6. React Hook Form + Zod란?

**쉬운 설명**: 폼 관리의 "자동화 도구" + "검증기"

```tsx
// Zod 스키마 (검증 규칙)
const loginSchema = z.object({
  email: z.string().email('이메일 형식이 아닙니다'),
  password: z.string().min(8, '최소 8자 이상'),
});

// React Hook Form 사용
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});

// 폼
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email')} />
  {errors.email && <span>{errors.email.message}</span>}
</form>
```

**장점**:
- 자동 검증: 제출 전에 유효성 검사
- 성능 최적화: 불필요한 re-render 방지
- 타입 안전: TypeScript와 완벽 통합

---

## 코드 상세 분석

### 1. 인증 스토어 (authStore.ts)

```typescript
import { create } from 'zustand';
import { User } from '../types/auth.types';

interface AuthState {
  // 상태 (State)
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // 액션 (Actions)
  login: (token: string, user: User) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태
  accessToken: null,
  user: null,
  isAuthenticated: false,

  // 로그인 액션
  login: (token: string, user: User) => {
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
    });
    // Refresh Token은 localStorage에 저장 가능
  },

  // 로그아웃 액션
  logout: () => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    });
    localStorage.clear();
  },

  // 토큰 갱신 액션
  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },
}));
```

**핵심 개념**:
- `create()`: Zustand 스토어 생성
- `set()`: 상태 업데이트 함수
- `accessToken`: 메모리에만 저장 (보안)
- `isAuthenticated`: 로그인 여부 확인용

**사용 예시**:
```typescript
// 컴포넌트에서
const { user, login, logout } = useAuthStore();

// 로그인
login('token123', { id: '1', email: 'user@example.com' });

// 사용자 정보 표시
console.log(user.email); // 'user@example.com'

// 로그아웃
logout();
```

---

### 2. Axios 인스턴스 (axios.ts)

```typescript
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,  // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 에러 시 로그아웃 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 아직 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // TODO: Refresh Token으로 새 Access Token 발급
      // 지금은 단순히 로그아웃 처리
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

**핵심 개념**:
- **Request Interceptor**: 요청 전에 실행
  - 모든 API 호출에 `Authorization: Bearer {token}` 헤더 추가
  - 매번 수동으로 추가할 필요 없음!

- **Response Interceptor**: 응답 후 실행
  - 401 에러(인증 만료) 감지
  - 자동 로그아웃 및 로그인 페이지 리다이렉트

**동작 순서**:
```
1. API 호출 → apiClient.get('/api/tickets')
2. Request Interceptor 실행 → 토큰 추가
3. 백엔드로 요청 전송
4. 백엔드 응답 수신
5. Response Interceptor 실행 → 에러 체크
6. 컴포넌트로 데이터 반환
```

---

### 3. 인증 API (auth.api.ts)

```typescript
import apiClient from './axios';
import {
  LoginRequest,
  LoginResponse,
  VerifyPinRequest,
  AuthResponse,
  AdminLoginRequest,
} from '../types/auth.types';

// 일반 사용자 로그인 (1단계)
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/auth/login', data);
  return response.data;
};

// PIN 인증 (2단계)
export const verifyPin = async (data: VerifyPinRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/verify', data);
  return response.data;
};

// 로그아웃
export const logout = async (): Promise<void> => {
  await apiClient.post('/api/auth/logout');
};

// 관리자 로그인
export const adminLogin = async (data: AdminLoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/admin/auth/login', data);
  return response.data;
};
```

**핵심 개념**:
- **타입 안전성**: TypeScript 제네릭 사용 (`<LoginResponse>`)
- **Promise 반환**: 비동기 처리 (async/await)
- **데이터 추출**: `response.data` 반환 (Axios 래퍼 제거)

**사용 예시**:
```typescript
// 컴포넌트에서
try {
  const result = await login({
    email: 'user@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    agreeTerms: true,
    agreePrivacy: true,
  });

  console.log(result.verificationId); // '12345'
  console.log(result.pins); // ['35', '17', '93']
} catch (error) {
  console.error('로그인 실패:', error);
}
```

---

### 4. 로그인 페이지 (LoginPage.tsx)

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/common/Input';
import Checkbox from '../components/common/Checkbox';
import Button from '../components/common/Button';
import { loginSchema, LoginFormData } from '../utils/validation';
import { login } from '../api/auth.api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // React Hook Form 초기화
  const {
    register,    // 입력 필드 등록
    handleSubmit, // 제출 핸들러
    formState: { errors }, // 검증 에러
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), // Zod 스키마 연결
  });

  // 폼 제출 핸들러
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setApiError('');

      // API 호출
      const response = await login({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        agreeTerms: data.agreeTerms,
        agreePrivacy: data.agreePrivacy,
      });

      // PIN 인증 페이지로 이동 (verificationId와 pins 전달)
      navigate('/login/verify', {
        state: {
          verificationId: response.verificationId,
          pins: response.pins,
          expiresAt: response.expiresAt,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setApiError(
        error.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">로그인</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mattermost 이메일 */}
          <Input
            label="mm 이메일"
            type="email"
            placeholder="example@email.com"
            error={errors.email?.message}
            {...register('email')}
            required
          />

          {/* 비밀번호 */}
          <Input
            label="비밀번호"
            type="password"
            placeholder="수자 4자리 입력"
            error={errors.password?.message}
            helperText="최소 8자리 이상 알파벳, 숫자 및 특수문자 포함"
            {...register('password')}
            required
          />

          {/* 비밀번호 확인 */}
          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호 재입력"
            error={errors.passwordConfirm?.message}
            {...register('passwordConfirm')}
            required
          />

          {/* 약관 동의 */}
          <div className="space-y-3 pt-2">
            <Checkbox
              label="최소 8자리 이상 알파벳 기호 및 보수 동의합니다"
              error={errors.agreeTerms?.message}
              {...register('agreeTerms')}
              required
            />

            <Checkbox
              label="서비스 이용약관 및 개인정보 처리 방침에 동의합니다"
              error={errors.agreePrivacy?.message}
              {...register('agreePrivacy')}
              required
            />
          </div>

          {/* API 에러 메시지 */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={isLoading}
            className="mt-6"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
```

**핵심 개념**:
- **React Hook Form**: 폼 상태 관리 자동화
- **Zod Resolver**: 자동 검증
- **에러 처리**: try-catch로 API 에러 처리
- **로딩 상태**: `isLoading`으로 버튼 비활성화
- **네비게이션**: `useNavigate`로 페이지 이동 + state 전달

**동작 순서**:
```
1. 사용자 입력 → React Hook Form이 관리
2. 제출 클릭 → Zod 검증 실행
3. 검증 성공 → onSubmit 실행
4. API 호출 → login()
5. 응답 수신 → verificationId, pins 획득
6. PIN 인증 페이지로 이동 (state와 함께)
```

---

### 5. Protected Route (ProtectedRoute.tsx)

```typescript
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // 로그인 안 했으면 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 로그인 했으면 자식 컴포넌트 렌더링
  return <Outlet />;
};

export default ProtectedRoute;
```

**핵심 개념**:
- **조건부 렌더링**: `isAuthenticated` 체크
- **Outlet**: 중첩 라우트의 자식 렌더링
- **Replace**: 브라우저 히스토리에서 현재 엔트리 대체 (뒤로가기 방지)

**동작 원리**:
```
사용자가 /home 접근 시도
  ↓
ProtectedRoute 체크
  ↓
isAuthenticated === false?
  → YES: Navigate to /login
  → NO: Outlet 렌더링 (HomePage)
```

**라우트 설정 예시**:
```typescript
<Routes>
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/tickets" element={<TicketsPage />} />
  </Route>
</Routes>
```

---

## 개발 가이드

### 새 페이지 추가하기

**1단계: 페이지 컴포넌트 생성**
```typescript
// src/pages/NewPage.tsx
import React from 'react';

const NewPage: React.FC = () => {
  return (
    <div>
      <h1>새 페이지</h1>
    </div>
  );
};

export default NewPage;
```

**2단계: 라우트 추가**
```typescript
// src/routes/index.tsx
import NewPage from '../pages/NewPage';

<Routes>
  {/* 기존 라우트... */}
  <Route path="/new-page" element={<NewPage />} />
</Routes>
```

**3단계: 네비게이션 링크 추가**
```typescript
import { Link } from 'react-router-dom';

<Link to="/new-page">새 페이지로 이동</Link>
```

---

### 새 API 엔드포인트 추가하기

**1단계: 타입 정의**
```typescript
// src/types/ticket.types.ts
export interface Ticket {
  id: string;
  flightNumber: string;
  departure: string;
  arrival: string;
}

export interface ScanTicketRequest {
  image: File;
}
```

**2단계: API 함수 작성**
```typescript
// src/api/ticket.api.ts
import apiClient from './axios';
import { Ticket, ScanTicketRequest } from '../types/ticket.types';

export const scanTicket = async (data: ScanTicketRequest): Promise<Ticket> => {
  const formData = new FormData();
  formData.append('image', data.image);

  const response = await apiClient.post<Ticket>('/api/tickets/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
```

**3단계: 컴포넌트에서 사용**
```typescript
import { scanTicket } from '../api/ticket.api';

const handleScan = async (file: File) => {
  try {
    const ticket = await scanTicket({ image: file });
    console.log('스캔 완료:', ticket);
  } catch (error) {
    console.error('스캔 실패:', error);
  }
};
```

---

### 새 공통 컴포넌트 만들기

**예시: Card 컴포넌트**
```typescript
// src/components/common/Card.tsx
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
```

**사용**:
```typescript
<Card title="내 티켓">
  <p>항공편: KE123</p>
  <p>출발: 인천</p>
</Card>
```

---

## 트러블슈팅

### 문제 1: 개발 서버가 시작되지 않음

**증상**:
```
npm run dev
Error: Cannot find module 'vite'
```

**해결**:
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

---

### 문제 2: Tailwind CSS 스타일이 적용 안 됨

**증상**: 클래스명을 작성했는데 스타일이 안 보임

**해결**:
1. `index.css` 확인:
   ```css
   @import "tailwindcss";
   ```

2. `postcss.config.js` 확인:
   ```javascript
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   }
   ```

3. 서버 재시작:
   ```bash
   # Ctrl+C로 중지 후
   npm run dev
   ```

---

### 문제 3: API 호출 시 CORS 에러

**증상**:
```
Access to XMLHttpRequest at 'http://localhost:8080/api/auth/login'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**해결**:
백엔드에서 CORS 설정 필요:
```java
// Spring Boot 예시
@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

---

### 문제 4: TypeScript 에러

**증상**:
```
TS2345: Argument of type 'string' is not assignable to parameter of type 'User'
```

**해결**:
1. 타입 정의 확인
2. 타입 캐스팅:
   ```typescript
   const user = data as User;
   ```

3. 타입 가드:
   ```typescript
   if (typeof data === 'string') {
     // 문자열 처리
   } else {
     // User 처리
   }
   ```

---

## 추가 자료

### 공식 문서
- [React 19 공식 문서](https://react.dev/)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)
- [Tailwind CSS v4 문서](https://tailwindcss.com/)
- [Vite 공식 문서](https://vitejs.dev/)
- [React Router 문서](https://reactrouter.com/)
- [Zustand 문서](https://zustand-demo.pmnd.rs/)

### 유용한 VS Code 확장
- **ESLint**: JavaScript/TypeScript 린팅
- **Prettier**: 코드 포맷팅
- **Tailwind CSS IntelliSense**: Tailwind 자동완성
- **TypeScript Error Translator**: 에러 메시지 번역

### 개발 팁
1. **콘솔 활용**: `console.log()`로 디버깅
2. **React DevTools**: 브라우저 확장 설치 (컴포넌트 검사)
3. **Network 탭**: API 호출 확인
4. **TypeScript 활용**: 타입 정의를 먼저 작성하면 개발이 훨씬 쉬워짐

---

## 마무리

이 가이드는 CARRY PORTER 프로젝트의 기본적인 이해와 새 컴퓨터에서 시작하는 방법을 다룹니다.

추가 질문이나 문제가 있다면:
1. `docs/` 폴더의 다른 문서 참조
2. 팀원에게 문의
3. 공식 문서 확인

**Happy Coding! 🚀**
