import { Button } from "@/components/ui/button";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { SendCodeFormData } from "../../utils/validation";
import { PasswordInputField } from "./PasswordInputField";

interface PasswordConfirmStepProps {
  register: UseFormRegister<SendCodeFormData>;
  errors: FieldErrors<SendCodeFormData>;
  password: string;
  isValid: boolean;
  onNext: () => void;
  onBack: () => void;
}

/**
 * 비밀번호 확인 단계 컴포넌트
 * 입력한 비밀번호와 일치 여부 확인
 */
export function PasswordConfirmStep({
  register,
  errors,
  password,
  isValid,
  onNext,
  onBack,
}: PasswordConfirmStepProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">비밀번호 확인</h2>
        <p className="text-sm text-gray-600">
          동일한 비밀번호를 다시 입력해주세요
        </p>
      </div>

      <div className="space-y-4" onKeyDown={handleKeyDown}>
        <PasswordInputField
          register={register}
          errors={errors}
          name="passwordConfirm"
          label="비밀번호 확인"
          placeholder="4자리 숫자"
        />
        {password && !errors.passwordConfirm && (
          <p className="text-sm text-green-600">
            비밀번호가 일치합니다
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          이전
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="w-full"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
