import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/common/Input';
import Checkbox from '../components/common/Checkbox';
import Button from '../components/common/Button';
import { loginSchema } from '../utils/validation';
import type { LoginFormData } from '../utils/validation';
import { login } from '../api/auth.api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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
            placeholder="숫자 4자리 입력"
            error={errors.password?.message}
            helperText="숫자 4자리를 입력하여 주세요."
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
              label="회수되지 않은 짐은 7일간 보관되는 것에 동의합니다."
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
