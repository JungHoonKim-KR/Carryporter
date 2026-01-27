# CARRY PORTER 코드 레퍼런스

> 모든 함수, 컴포넌트, 타입의 상세 설명

---

## 목차

1. [타입 정의](#타입-정의)
2. [API 함수](#api-함수)
3. [상태 관리](#상태-관리)
4. [공통 컴포넌트](#공통-컴포넌트)
5. [페이지 컴포넌트](#페이지-컴포넌트)
6. [유틸리티 함수](#유틸리티-함수)

---

## 타입 정의

### User
**위치**: `src/types/auth.types.ts`

```typescript
interface User {
  id: string;          // 사용자 고유 ID
  email: string;       // 이메일 주소
  name?: string;       // 이름 (선택)
  role: 'USER' | 'ADMIN';  // 역할
}
```

**사용 예시**:
```typescript
const user: User = {
  id: '123',
  email: 'user@example.com',
  role: 'USER'
};
```

---

### LoginRequest
**위치**: `src/types/auth.types.ts`

```typescript
interface LoginRequest {
  email: string;           // Mattermost 이메일
  password: string;        // 비밀번호
  passwordConfirm: string; // 비밀번호 확인
  agreeTerms: boolean;     // 약관 동의
  agreePrivacy: boolean;   // 개인정보 동의
}
```

**검증 규칙**:
- `email`: 이메일 형식
- `password`: 최소 8자, 영문+숫자+특수문자
- `passwordConfirm`: password와 일치
- `agreeTerms`: true 필수
- `agreePrivacy`: true 필수

---

### LoginResponse
**위치**: `src/types/auth.types.ts`

```typescript
interface LoginResponse {
  verificationId: string;  // PIN 인증용 ID
  expiresAt: string;       // 만료 시간 (ISO 8601)
  pins: string[];          // PIN 번호 배열 (3개)
}
```

**예시 응답**:
```json
{
  "verificationId": "abc123def",
  "expiresAt": "2026-01-25T23:00:00Z",
  "pins": ["35", "17", "93"]
}
```

---

### VerifyPinRequest
**위치**: `src/types/auth.types.ts`

```typescript
interface VerifyPinRequest {
  verificationId: string;  // 로그인 시 받은 ID
  pin: string;             // 사용자가 선택한 PIN
}
```

---

### AuthResponse
**위치**: `src/types/auth.types.ts`

```typescript
interface AuthResponse {
  accessToken: string;   // JWT 액세스 토큰
  refreshToken: string;  // JWT 리프레시 토큰
  user: User;           // 사용자 정보
}
```

**예시 응답**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpcyBpcyByZWZyZXNo...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

---

## API 함수

### login()
**위치**: `src/api/auth.api.ts`

**목적**: 1단계 로그인 (이메일 + 비밀번호)

**시그니처**:
```typescript
async function login(data: LoginRequest): Promise<LoginResponse>
```

**파라미터**:
- `data`: LoginRequest 객체

**반환값**: LoginResponse (verificationId, pins)

**예외**:
- `400`: 잘못된 요청 (validation 실패)
- `401`: 인증 실패 (이메일/비밀번호 불일치)
- `500`: 서버 에러

**사용 예시**:
```typescript
try {
  const response = await login({
    email: 'user@example.com',
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    agreeTerms: true,
    agreePrivacy: true,
  });

  console.log(response.verificationId);
  console.log(response.pins); // ['35', '17', '93']
} catch (error) {
  if (error.response?.status === 401) {
    alert('이메일 또는 비밀번호가 틀렸습니다');
  }
}
```

---

### verifyPin()
**위치**: `src/api/auth.api.ts`

**목적**: 2단계 인증 (PIN 번호 확인)

**시그니처**:
```typescript
async function verifyPin(data: VerifyPinRequest): Promise<AuthResponse>
```

**파라미터**:
- `data.verificationId`: 로그인 시 받은 ID
- `data.pin`: 사용자가 선택한 PIN

**반환값**: AuthResponse (accessToken, refreshToken, user)

**예외**:
- `400`: 잘못된 verificationId
- `401`: 틀린 PIN 번호
- `410`: PIN 만료

**사용 예시**:
```typescript
try {
  const response = await verifyPin({
    verificationId: 'abc123def',
    pin: '35',
  });

  // 토큰 저장
  useAuthStore.getState().login(response.accessToken, response.user);

  // 홈으로 이동
  navigate('/');
} catch (error) {
  if (error.response?.status === 401) {
    alert('틀린 PIN 번호입니다');
  }
}
```

---

### logout()
**위치**: `src/api/auth.api.ts`

**목적**: 로그아웃 (서버에 알림)

**시그니처**:
```typescript
async function logout(): Promise<void>
```

**파라미터**: 없음

**반환값**: 없음

**예외**:
- `401`: 인증되지 않은 요청

**사용 예시**:
```typescript
const handleLogout = async () => {
  try {
    await logout();
    useAuthStore.getState().logout(); // 로컬 상태 정리
    navigate('/login');
  } catch (error) {
    console.error('로그아웃 실패:', error);
    // 에러가 나도 로컬 로그아웃은 진행
    useAuthStore.getState().logout();
    navigate('/login');
  }
};
```

---

### adminLogin()
**위치**: `src/api/auth.api.ts`

**목적**: 관리자 로그인

**시그니처**:
```typescript
async function adminLogin(data: AdminLoginRequest): Promise<AuthResponse>
```

**파라미터**:
- `data.username`: 관리자 사용자명
- `data.password`: 비밀번호

**반환값**: AuthResponse

**예외**:
- `401`: 인증 실패
- `403`: 권한 없음 (관리자 아님)

**사용 예시**:
```typescript
try {
  const response = await adminLogin({
    username: 'admin',
    password: 'AdminPass123!',
  });

  useAuthStore.getState().login(response.accessToken, response.user);
  navigate('/admin/dashboard');
} catch (error) {
  alert('관리자 로그인 실패');
}
```

---

## 상태 관리

### useAuthStore
**위치**: `src/store/authStore.ts`

**목적**: 전역 인증 상태 관리

**상태**:
```typescript
{
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
```

**액션**:

#### login()
```typescript
login: (token: string, user: User) => void
```
- 로그인 성공 시 호출
- accessToken, user 저장
- isAuthenticated를 true로 설정

**사용**:
```typescript
const { login } = useAuthStore();
login('token123', { id: '1', email: 'user@example.com', role: 'USER' });
```

---

#### logout()
```typescript
logout: () => void
```
- 로그아웃 시 호출
- 모든 상태 초기화
- localStorage 클리어

**사용**:
```typescript
const { logout } = useAuthStore();
logout();
```

---

#### setAccessToken()
```typescript
setAccessToken: (token: string) => void
```
- Access Token 갱신 시 호출
- Refresh Token으로 새 토큰 발급받았을 때 사용

**사용**:
```typescript
const { setAccessToken } = useAuthStore();
setAccessToken('newToken456');
```

---

**컴포넌트에서 사용**:
```typescript
function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <div>로그인이 필요합니다</div>;
  }

  return (
    <div>
      <p>환영합니다, {user.email}님!</p>
      <button onClick={logout}>로그아웃</button>
    </div>
  );
}
```

---

## 공통 컴포넌트

### Button
**위치**: `src/components/common/Button.tsx`

**Props**:
```typescript
interface ButtonProps {
  children: React.ReactNode;  // 버튼 텍스트
  onClick?: () => void;       // 클릭 핸들러
  type?: 'button' | 'submit' | 'reset';  // 버튼 타입
  variant?: 'primary' | 'secondary' | 'outline';  // 스타일
  size?: 'sm' | 'md' | 'lg';  // 크기
  fullWidth?: boolean;        // 전체 너비
  disabled?: boolean;         // 비활성화
  className?: string;         // 추가 클래스
}
```

**기본값**:
- `type`: 'button'
- `variant`: 'primary'
- `size`: 'md'
- `fullWidth`: false
- `disabled`: false

**사용 예시**:
```tsx
// 기본 버튼
<Button onClick={handleClick}>클릭하세요</Button>

// 전체 너비, 큰 사이즈
<Button fullWidth size="lg">로그인</Button>

// 보조 버튼
<Button variant="secondary">취소</Button>

// 외곽선 버튼
<Button variant="outline">더보기</Button>

// 비활성화
<Button disabled>처리 중...</Button>

// 폼 제출
<Button type="submit">제출</Button>
```

**스타일**:
- `primary`: 파란색 배경, 흰색 텍스트
- `secondary`: 회색 배경, 검정 텍스트
- `outline`: 투명 배경, 파란색 테두리

---

### Input
**위치**: `src/components/common/Input.tsx`

**Props**:
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;       // 라벨
  error?: string;       // 에러 메시지
  helperText?: string;  // 도움말 텍스트
}
```

**특징**:
- `forwardRef` 사용 (React Hook Form 연동)
- 에러 시 빨간색 테두리
- required 시 라벨에 * 표시

**사용 예시**:
```tsx
// 기본
<Input
  label="이메일"
  type="email"
  placeholder="example@email.com"
/>

// 에러 표시
<Input
  label="비밀번호"
  type="password"
  error="최소 8자 이상 입력하세요"
/>

// 도움말
<Input
  label="전화번호"
  type="tel"
  helperText="'-' 없이 입력하세요"
/>

// React Hook Form 연동
<Input
  label="이메일"
  type="email"
  error={errors.email?.message}
  {...register('email')}
  required
/>
```

---

### Checkbox
**위치**: `src/components/common/Checkbox.tsx`

**Props**:
```typescript
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;   // 라벨 (필수)
  error?: string;  // 에러 메시지
}
```

**특징**:
- `forwardRef` 사용
- 라벨 클릭 가능
- required 시 * 표시

**사용 예시**:
```tsx
// 기본
<Checkbox label="약관에 동의합니다" />

// 에러 표시
<Checkbox
  label="필수 약관에 동의합니다"
  error="동의가 필요합니다"
/>

// React Hook Form 연동
<Checkbox
  label="서비스 이용약관에 동의합니다"
  error={errors.agreeTerms?.message}
  {...register('agreeTerms')}
  required
/>
```

---

### AuthLayout
**위치**: `src/components/layouts/AuthLayout.tsx`

**Props**:
```typescript
interface AuthLayoutProps {
  children: React.ReactNode;  // 컨텐츠
  showHeader?: boolean;       // 헤더 표시 여부
}
```

**기본값**:
- `showHeader`: true

**특징**:
- 파란색 그라데이션 배경
- CARRYPORTER 로고 헤더
- 중앙 정렬 컨텐츠 영역
- 반응형 (모바일/데스크톱)

**사용 예시**:
```tsx
// 헤더 포함
<AuthLayout>
  <LoginForm />
</AuthLayout>

// 헤더 없음 (스플래시용)
<AuthLayout showHeader={false}>
  <SplashContent />
</AuthLayout>
```

---

## 페이지 컴포넌트

### SplashPage
**위치**: `src/pages/SplashPage.tsx`

**기능**:
- 앱 첫 화면
- CARRY PORTER 로고 표시
- 로봇 일러스트
- "시작하기" 버튼
- 3초 후 자동 로그인 페이지 이동

**상태**: 없음

**훅**:
- `useNavigate`: 페이지 이동
- `useEffect`: 자동 전환 타이머

**플로우**:
```
1. 페이지 마운트
2. 3초 타이머 시작
3. 사용자 버튼 클릭 또는 타이머 만료
4. /login으로 이동
```

---

### LoginPage
**위치**: `src/pages/LoginPage.tsx`

**기능**:
- Mattermost 이메일 로그인
- 폼 검증 (Zod)
- API 호출
- PIN 인증 페이지로 이동

**상태**:
- `isLoading`: 로딩 중 여부
- `apiError`: API 에러 메시지

**훅**:
- `useNavigate`: 페이지 이동
- `useForm`: 폼 관리
- `useState`: 로컬 상태

**폼 필드**:
1. 이메일 (email)
2. 비밀번호 (password)
3. 비밀번호 확인 (passwordConfirm)
4. 약관 동의 (agreeTerms)
5. 개인정보 동의 (agreePrivacy)

**검증 규칙**:
- 이메일 형식
- 비밀번호 8자 이상, 영문+숫자+특수문자
- 비밀번호 일치
- 약관 동의 필수

**플로우**:
```
1. 사용자 입력
2. 폼 검증 (Zod)
3. API 호출 (login)
4. 응답 수신 (verificationId, pins)
5. /login/verify로 이동 (state 전달)
```

---

### PinVerificationPage
**위치**: `src/pages/PinVerificationPage.tsx`

**기능**:
- PIN 번호 선택
- 2단계 인증
- 토큰 저장
- 홈으로 이동

**상태**:
- `selectedPin`: 선택된 PIN
- `isLoading`: 로딩 중 여부
- `apiError`: API 에러 메시지

**훅**:
- `useNavigate`: 페이지 이동
- `useLocation`: state 수신
- `useAuthStore`: 로그인 처리
- `useState`: 로컬 상태

**Props (from state)**:
```typescript
{
  verificationId: string;
  pins: string[];
  expiresAt: string;
}
```

**플로우**:
```
1. 이전 페이지에서 state 수신
2. 3개 PIN 버튼 렌더링
3. 사용자 PIN 선택
4. API 호출 (verifyPin)
5. 응답 수신 (accessToken, user)
6. Zustand 스토어에 저장
7. /로 이동
```

**에러 처리**:
- state 없음 → /login 리다이렉트
- PIN 틀림 → 에러 메시지 표시

---

### HomePage
**위치**: `src/pages/HomePage.tsx`

**기능**:
- 로그인 후 메인 화면
- 사용자 정보 표시
- 로그아웃

**상태**: 없음

**훅**:
- `useNavigate`: 페이지 이동
- `useAuthStore`: 사용자 정보, 로그아웃

**UI**:
- 헤더: CARRY PORTER 로고, 로그아웃 버튼
- 메인: 환영 메시지, 이메일 표시, 다음 단계 안내

**플로우**:
```
1. 사용자 정보 표시
2. 로그아웃 버튼 클릭
3. API 호출 (logout)
4. Zustand 스토어 정리
5. /login으로 이동
```

---

## 유틸리티 함수

### loginSchema
**위치**: `src/utils/validation.ts`

**목적**: 로그인 폼 검증 스키마

**타입**: `z.ZodObject`

**검증 규칙**:
```typescript
{
  email: 이메일 형식,
  password: 최소 8자, 영문+숫자+특수문자,
  passwordConfirm: 입력 필수,
  agreeTerms: true 필수,
  agreePrivacy: true 필수,
}
+ password === passwordConfirm 검증
```

**사용**:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

---

### adminLoginSchema
**위치**: `src/utils/validation.ts`

**목적**: 관리자 로그인 폼 검증 스키마

**타입**: `z.ZodObject`

**검증 규칙**:
```typescript
{
  username: 입력 필수,
  password: 입력 필수,
}
```

---

### LoginFormData
**위치**: `src/utils/validation.ts`

**목적**: 로그인 폼 데이터 타입

**정의**:
```typescript
type LoginFormData = z.infer<typeof loginSchema>;

// 결과:
{
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}
```

**사용**:
```typescript
const onSubmit = (data: LoginFormData) => {
  console.log(data.email);
  console.log(data.password);
};
```

---

## Axios 인터셉터

### Request Interceptor
**위치**: `src/api/axios.ts`

**목적**: 모든 요청에 토큰 자동 추가

**코드**:
```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

**동작**:
1. 요청 전에 실행
2. Zustand 스토어에서 accessToken 가져오기
3. 토큰 있으면 Authorization 헤더 추가
4. 수정된 config 반환

**결과**:
```
모든 API 호출:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### Response Interceptor
**위치**: `src/api/axios.ts`

**목적**: 401 에러 시 자동 로그아웃

**코드**:
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      // TODO: Refresh Token 로직
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**동작**:
1. 응답 에러 발생
2. 401 에러 체크
3. 재시도 플래그 확인
4. 로그아웃 처리
5. 로그인 페이지로 리다이렉트

**개선 가능**:
- Refresh Token으로 새 Access Token 발급
- 원래 요청 재시도

---

## 환경 변수

### VITE_API_BASE_URL
**파일**: `.env.development`

**값**: `http://localhost:8080`

**용도**: 백엔드 API 서버 주소

**사용**:
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
```

**주의**: Vite 환경 변수는 `VITE_` 접두사 필수!

---

## 라우팅 구조

```
/splash               - 스플래시 화면 (공개)
/login                - 로그인 (공개)
/login/verify         - PIN 인증 (공개)
/                     - 홈 (보호됨)
/admin/login          - 관리자 로그인 (공개)
/admin/dashboard      - 관리자 대시보드 (보호됨)
```

**보호된 라우트**: `ProtectedRoute`로 감싸짐
- 로그인 안 했으면 → `/login` 리다이렉트

**공개 라우트**: 누구나 접근 가능

---

## 파일 크기 가이드

**작은 파일 (< 100 줄)**:
- 타입 정의
- 상태 관리
- 유틸리티 함수

**중간 파일 (100-300 줄)**:
- 공통 컴포넌트
- API 함수
- 간단한 페이지

**큰 파일 (> 300 줄)**:
- 복잡한 페이지
- 폼이 많은 페이지
→ 나중에 리팩토링 고려

---

## 명명 규칙

**컴포넌트**: PascalCase
```typescript
Button.tsx
LoginPage.tsx
AuthLayout.tsx
```

**함수/변수**: camelCase
```typescript
const handleSubmit = () => {};
const isLoading = false;
```

**타입/인터페이스**: PascalCase
```typescript
interface User {}
type LoginFormData = {};
```

**파일**: PascalCase (컴포넌트), camelCase (유틸리티)
```
Button.tsx
validation.ts
```

**CSS 클래스**: kebab-case (Tailwind는 예외)
```css
.my-custom-class {}
```

---

## 성능 최적화 팁

1. **React.memo**: 불필요한 re-render 방지
   ```typescript
   const Button = React.memo(({ children, onClick }) => {
     return <button onClick={onClick}>{children}</button>;
   });
   ```

2. **useMemo**: 비용이 큰 계산 캐싱
   ```typescript
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(a, b);
   }, [a, b]);
   ```

3. **useCallback**: 함수 재생성 방지
   ```typescript
   const handleClick = useCallback(() => {
     console.log('clicked');
   }, []);
   ```

4. **Code Splitting**: 동적 import
   ```typescript
   const HomePage = React.lazy(() => import('./pages/HomePage'));
   ```

---

## 보안 체크리스트

- ✅ Access Token은 메모리에만 저장 (XSS 방지)
- ✅ HTTPS 사용 (Production)
- ✅ 비밀번호는 평문으로 전송 (HTTPS 내에서)
- ✅ 401 에러 시 자동 로그아웃
- ⏳ Refresh Token 구현 (추후)
- ⏳ CSRF 토큰 (추후)
- ⏳ Rate Limiting (추후)

---

## 테스트 가이드

### 단위 테스트 (추후)
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('버튼 클릭 시 핸들러 호출', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>클릭</Button>);

  fireEvent.click(screen.getByText('클릭'));
  expect(handleClick).toHaveBeenCalled();
});
```

### E2E 테스트 (추후)
```typescript
// login.e2e.ts
test('로그인 플로우', async () => {
  await page.goto('http://localhost:5173/login');
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/login/verify');
});
```

---

**이 문서는 코드 변경 시 함께 업데이트해야 합니다!**
