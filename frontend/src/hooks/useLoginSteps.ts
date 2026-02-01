import { useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import type { SendCodeFormData } from '../utils/validation';

export type LoginStep = 'EMAIL' | 'PASSWORD' | 'PASSWORD_CONFIRM' | 'TERMS';

interface UseLoginStepsProps {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  agreeTerms?: boolean;
  agreePrivacy?: boolean;
  errors: FieldErrors<SendCodeFormData>;
}

/**
 * 로그인 단계 관리 훅
 */
export const useLoginSteps = ({
  email,
  password,
  passwordConfirm,
  agreeTerms,
  agreePrivacy,
  errors,
}: UseLoginStepsProps) => {
  const [currentStep, setCurrentStep] = useState<LoginStep>('EMAIL');

  // 이메일 유효성 검사
  const isEmailValid = email && email.includes('@') && !errors.email;

  // 패스워드 유효성 검사
  const isPasswordValid = password && password.length === 4 && !errors.password;

  // 패스워드 확인 유효성 검사
  const isPasswordConfirmValid = passwordConfirm && passwordConfirm === password && !errors.passwordConfirm;

  // 약관 동의 완료
  const isTermsValid = agreeTerms && agreePrivacy;

  // 다음 단계로 이동
  const handleNextStep = () => {
    if (currentStep === 'EMAIL' && isEmailValid) {
      setCurrentStep('PASSWORD');
    } else if (currentStep === 'PASSWORD' && isPasswordValid) {
      setCurrentStep('PASSWORD_CONFIRM');
    } else if (currentStep === 'PASSWORD_CONFIRM' && isPasswordConfirmValid) {
      setCurrentStep('TERMS');
    }
  };

  // 이전 단계로 이동
  const handlePrevStep = () => {
    if (currentStep === 'PASSWORD') {
      setCurrentStep('EMAIL');
    } else if (currentStep === 'PASSWORD_CONFIRM') {
      setCurrentStep('PASSWORD');
    } else if (currentStep === 'TERMS') {
      setCurrentStep('PASSWORD_CONFIRM');
    }
  };

  return {
    currentStep,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmValid,
    isTermsValid,
    handleNextStep,
    handlePrevStep,
  };
};
