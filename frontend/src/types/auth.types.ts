// 사용자 정보 타입
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
}

// 로그인 요청 (Mattermost 이메일 + 비밀번호)
export interface LoginRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

// 로그인 응답 (verificationId와 PIN 번호들)
export interface LoginResponse {
  verificationId: string;
  expiresAt: string;
  pins: string[]; // ["35", "17", "93"] 같은 3개 번호
}

// PIN 인증 요청
export interface VerifyPinRequest {
  verificationId: string;
  pin: string;
}

// 인증 성공 응답 (토큰 + 사용자 정보)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// 관리자 로그인 요청
export interface AdminLoginRequest {
  username: string;
  password: string;
}

// API 에러 응답
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
