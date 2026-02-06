import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useLoginForm } from "@/hooks/useLoginForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInputField } from "@/components/auth/PasswordInputField";
import { TermsCheckbox } from "@/components/auth/TermsCheckbox";
import { AppHeader } from "@/components/layouts/AppHeader";

const LoginPage = () => {
    const { isAuthenticated, clearAuth } = useAuthStore();
    const { form, onSubmit, isLoading, apiError } = useLoginForm();

    // 로그인 페이지 진입 시 기존 인증 정보 클리어
    useEffect(() => {
        if (isAuthenticated) {
            clearAuth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { register, handleSubmit, control, watch, formState: { errors, isValid } } = form;

    // 폼 값 감시 (비밀번호 일치 확인용)
    const password = watch("password");
    const passwordConfirm = watch("passwordConfirm");
    const agreeTerms = watch("agreeTerms");
    const agreePrivacy = watch("agreePrivacy");

    // 폼 전체 유효성 검사
    const isFormValid = isValid && agreeTerms && agreePrivacy;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <AppHeader />

            {/* 메인 컨텐츠 */}
            <main className="max-w-md mx-auto px-6 py-6">
                {/* 환영 메시지 */}
                <div className="mb-5 animate-fade-in-up">
                    <h2 className="text-heading-2 mb-1">
                        환영합니다! 👋
                    </h2>
                    <p className="text-body-small">
                        편리한 짐 운반 서비스를 시작하세요
                    </p>
                </div>

                {/* 로그인 폼 카드 */}
                <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-up">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {/* 폼 제목 */}
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold text-gray-900">
                                로그인
                            </h2>
                            <p className="text-sm text-gray-600">
                                CARRY PORTER 이용을 위해 정보를 입력해주세요
                            </p>
                        </div>

                        {/* 모든 입력 필드 */}
                        <div className="space-y-4">
                            {/* 1. 이메일 필드 */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Mattermost 이메일
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    {...register("email")}
                                    className={
                                        errors.email ? "border-red-500" : ""
                                    }
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* 2. 비밀번호 필드 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    비밀번호 (4자리 숫자)
                                </label>
                                <PasswordInputField
                                    register={register}
                                    errors={errors}
                                    name="password"
                                    label=""
                                    placeholder="4자리 숫자"
                                />
                            </div>

                            {/* 3. 비밀번호 확인 필드 */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    비밀번호 확인
                                </label>
                                <PasswordInputField
                                    register={register}
                                    errors={errors}
                                    name="passwordConfirm"
                                    label=""
                                    placeholder="4자리 숫자"
                                />
                                {passwordConfirm &&
                                    password &&
                                    passwordConfirm === password &&
                                    !errors.passwordConfirm && (
                                        <p className="text-sm text-green-600">
                                            ✓ 비밀번호가 일치합니다
                                        </p>
                                    )}
                            </div>

                            {/* 4. 약관 동의 */}
                            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
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

                            {/* 약관 설명 */}
                            <div className="text-[10px] text-gray-500 space-y-0.5">
                                <p>
                                    · 보관 정책: 짐 보관 안전 및 책임 범위
                                </p>
                                <p>
                                    · 이용약관: 로봇 호출 서비스 준수사항
                                </p>
                            </div>
                        </div>

                        {/* API 에러 메시지 */}
                        {apiError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-red-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <p className="text-sm text-red-600">
                                        {apiError}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 단일 제출 버튼 */}
                        <Button
                            type="submit"
                            size="lg"
                            disabled={!isFormValid || isLoading}
                            className="w-full bg-toss-blue-500 hover:bg-toss-blue-600 text-white disabled:opacity-40"
                        >
                            {isLoading ? "처리 중..." : "로그인"}
                        </Button>
                    </form>
                </div>

                {/* 안내 텍스트 */}
                <p className="text-center text-sm text-gray-500 mt-6 animate-fade-in-up">
                    가장 낮은 눈높이에서, 가장 높은 서비스를
                </p>
            </main>
        </div>
    );
};

export default LoginPage;
