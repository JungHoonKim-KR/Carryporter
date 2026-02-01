import { Button } from "@/components/ui/button";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { SendCodeFormData } from "../../utils/validation";
import { PasswordInputField } from "./PasswordInputField";

interface PasswordInputStepProps {
  register: UseFormRegister<SendCodeFormData>;
  errors: FieldErrors<SendCodeFormData>;
  isValid: boolean;
  onNext: () => void;
  onBack: () => void;
}

/**
 * 비밀번호 입력 단계 컴포넌트
 * 4자리 숫자 비밀번호 입력
 */
export function PasswordInputStep({
  register,
  errors,
  isValid,
  onNext,
  onBack,
}: PasswordInputStepProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">비밀번호 설정</h2>
        <p className="text-sm text-gray-600">
          4자리 숫자 비밀번호를 입력해주세요
        </p>
      </div>

      <div onKeyDown={handleKeyDown}>
        <PasswordInputField
          register={register}
          errors={errors}
          name="password"
          label="비밀번호"
          placeholder="4자리 숫자"
        />
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
