import { Button } from "@/components/ui/button";
import type { Control, FieldErrors } from "react-hook-form";
import type { SendCodeFormData } from "../../utils/validation";
import { TermsCheckbox } from "./TermsCheckbox";

interface TermsAgreementStepProps {
  control: Control<SendCodeFormData>;
  errors: FieldErrors<SendCodeFormData>;
  isValid: boolean;
  onSubmit: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

/**
 * 약관 동의 단계 컴포넌트
 * 보관 정책 및 서비스 이용약관 동의
 */
export function TermsAgreementStep({
  control,
  errors,
  isValid,
  onSubmit,
  onBack,
  isLoading = false,
}: TermsAgreementStepProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid && !isLoading) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-6" onKeyDown={handleKeyDown}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">약관 동의</h2>
        <p className="text-sm text-gray-600">
          서비스 이용을 위해 약관에 동의해주세요
        </p>
      </div>

      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <TermsCheckbox
          control={control}
          name="agreeTerms"
          label="보관 정책에 동의합니다 (필수)"
          errors={errors}
        />
        <TermsCheckbox
          control={control}
          name="agreePrivacy"
          label="서비스 이용약관에 동의합니다 (필수)"
          errors={errors}
        />
      </div>

      <div className="text-xs text-gray-500 space-y-2">
        <p>
          · 보관 정책: 짐 보관 시 안전 및 책임 범위에 대한 내용입니다.
        </p>
        <p>
          · 서비스 이용약관: 로봇 호출 서비스 이용 시 준수사항입니다.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="w-full"
        >
          이전
        </Button>
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={!isValid || isLoading}
          className="w-full"
        >
          {isLoading ? "처리 중..." : "회원가입"}
        </Button>
      </div>
    </div>
  );
}
