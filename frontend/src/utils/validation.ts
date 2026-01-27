import { z } from 'zod';

// 로그인 폼 검증 스키마
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),

  password: z
    .string()
    .min(4, '비밀번호는 최소 4자 이상이어야 합니다'),

  passwordConfirm: z
    .string()
    .min(1, '비밀번호 확인을 입력해주세요'),

  agreeTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: '서비스 이용약관에 동의해주세요',
    }),

  agreePrivacy: z
    .boolean()
    .refine((val) => val === true, {
      message: '개인정보 처리방침에 동의해주세요',
    }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

// 관리자 로그인 폼 검증 스키마
export const adminLoginSchema = z.object({
  username: z
    .string()
    .min(1, '사용자명을 입력해주세요'),

  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요'),
});

// 타입 추출
export type LoginFormData = z.infer<typeof loginSchema>;
export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
