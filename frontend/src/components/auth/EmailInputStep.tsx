import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { SendCodeFormData } from "../../utils/validation";

interface EmailInputStepProps {
  register: UseFormRegister<SendCodeFormData>;
  errors: FieldErrors<SendCodeFormData>;
  isValid: boolean;
  onNext: () => void;
}

/**
 * 이메일 입력 단계 컴포넌트
 * 로그인 플로우의 첫 번째 단계
 */
export function EmailInputStep({
  register,
  errors,
  isValid,
  onNext,
}: EmailInputStepProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isValid) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">이메일 입력</h2>
        <p className="text-sm text-gray-600">
          가입하신 이메일 주소를 입력해주세요
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          이메일
        </label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          {...register("email")}
          onKeyDown={handleKeyDown}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={!isValid}
        className="w-full"
      >
        다음
      </Button>
    </div>
  );
}
