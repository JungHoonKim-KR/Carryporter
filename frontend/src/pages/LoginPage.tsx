import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/layouts/AuthLayout';
import Input from '../components/common/Input';
import Checkbox from '../components/common/Checkbox';
import { Button } from '@/components/ui/button';
import { sendCodeSchema, type SendCodeFormData } from '../utils/validation';
import { sendCode } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // 로그인 페이지 진입 시 기존 인증 정보 클리어
  // (뒤로가기로 왔을 때 처음부터 다시 시작하도록)
  useEffect(() => {
    if (isAuthenticated) {
      clearAuth();
    }
  }, []); // 마운트 시 1회만 실행

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SendCodeFormData>({
    resolver: zodResolver(sendCodeSchema),
  });

  const onSubmit = async (data: SendCodeFormData) => {
    try {
      setIsLoading(true);
      setApiError('');

      // 인증번호 발송 API 호출
      const response = await sendCode({
        email: data.email,
        password: parseInt(data.password, 10), // string을 number로 변환
      });

      console.log('=== 1단계 인증번호 발송 성공 ===');
      console.log('응답 데이터:', response);
      console.log('받은 CODE:', response.code, '(type:', typeof response.code, ')');

      // CODE 선택 페이지로 이동 (email, code 전달)
      navigate('/login/verify', {
        state: {
          email: data.email,
          code: response.code, // 실제 CODE 번호 (예: 35)
        },
        replace: true, // 히스토리 스택을 대체하여 뒤로가기 방지
      });
    } catch (error: any) {
      console.error('Send code error:', error);
      setApiError(
        error.response?.data?.message || '인증번호 발송에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* 카드 컨테이너 */}
      <div className="bg-white rounded-3xl shadow-2xl p-10">
        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-left">로그인</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* MM 이메일 */}
          <Input
            label="MM 이메일"
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
            {...register('password')}
            required
            maxLength={4}
          />

          {/* 비밀번호 확인 */}
          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호 재입력"
            error={errors.passwordConfirm?.message}
            {...register('passwordConfirm')}
            required
            maxLength={4}
          />

          {/* 약관 동의 박스 */}
          <div className="bg-gray-100 rounded-lg p-4 space-y-3">
            <Checkbox
              label="회수되지 않은 짐은 7일간 보관되는 것에 동의합니다."
              error={errors.agreeTerms?.message}
              {...register('agreeTerms')}
              required
            />

            <Checkbox
              label="서비스 이용약관 및 개인정보 처리 방침에 동의합니다."
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
            size="lg"
            disabled={isLoading}
            className="w-full mt-6"
          >
            {isLoading ? '전송 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
