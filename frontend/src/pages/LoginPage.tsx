import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { sendCodeSchema, type SendCodeFormData } from "../utils/validation";
import { sendCode } from "../api/auth.api";
import { setMockPassword } from "../api/mission.api.mock";
import { useAuthStore } from "../store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInputField } from "@/components/auth/PasswordInputField";
import { TermsCheckbox } from "@/components/auth/TermsCheckbox";

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, clearAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [logoError, setLogoError] = useState(false);

    // 로그인 페이지 진입 시 기존 인증 정보 클리어
    useEffect(() => {
        if (isAuthenticated) {
            clearAuth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isValid },
    } = useForm<SendCodeFormData>({
        resolver: zodResolver(sendCodeSchema),
        mode: "onChange",
    });

    // 폼 값 감시 (비밀번호 일치 확인용)
    const password = watch("password");
    const passwordConfirm = watch("passwordConfirm");
    const agreeTerms = watch("agreeTerms");
    const agreePrivacy = watch("agreePrivacy");

    // 폼 전체 유효성 검사
    const isFormValid = isValid && agreeTerms && agreePrivacy;

    const onSubmit = async (data: SendCodeFormData) => {
        try {
            setIsLoading(true);
            setApiError("");

            // 인증번호 발송 API 호출
            const response = await sendCode({
                email: data.email,
                password: parseInt(data.password, 10),
            });

            // Mock API용: 비밀번호 저장
            setMockPassword(parseInt(data.password, 10));

            if (import.meta.env.DEV)
                console.log("=== 1단계 인증번호 발송 성공 ===");
            if (import.meta.env.DEV) console.log("응답 데이터:", response);

            // CODE 선택 페이지로 이동
            navigate("/login/verify", {
                state: {
                    email: data.email,
                    code: response.code,
                },
            });
        } catch (error: any) {
            console.error("Send code error:", error);
            setApiError(
                error.response?.data?.message ||
                    "인증번호 발송에 실패했습니다. 다시 시도해주세요."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-gray-50 pt-safe">
                <div className="max-w-md mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-toss-blue-500 rounded-xl flex items-center justify-center">
                            <img
                                src="/images/logo.png"
                                alt="CARRY PORTER Logo"
                                className={cn("w-6 h-6", logoError && "hidden")}
                                onError={() => setLogoError(true)}
                            />
                        </div>
                        <h1 className="text-gray-900 text-lg font-bold">
                            CARRY PORTER
                        </h1>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-md mx-auto px-6 py-6">
                {/* 환영 메시지 */}
                <div className="mb-5 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        환영합니다! 👋
                    </h2>
                    <p className="text-gray-500">
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
