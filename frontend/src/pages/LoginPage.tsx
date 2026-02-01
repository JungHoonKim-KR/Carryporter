import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { sendCodeSchema, type SendCodeFormData } from "../utils/validation";
import { sendCode } from "../api/auth.api";
import { setMockPassword } from "../api/mission.api.mock";
import { useAuthStore } from "../store/authStore";
import { useLoginSteps } from "../hooks/useLoginSteps";
import { EmailInputStep } from "@/components/auth/EmailInputStep";
import { PasswordInputStep } from "@/components/auth/PasswordInputStep";
import { PasswordConfirmStep } from "@/components/auth/PasswordConfirmStep";
import { TermsAgreementStep } from "@/components/auth/TermsAgreementStep";

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
        formState: { errors },
    } = useForm<SendCodeFormData>({
        resolver: zodResolver(sendCodeSchema),
        mode: 'onChange',
    });

    // 폼 값 감시
    const email = watch('email');
    const password = watch('password');
    const passwordConfirm = watch('passwordConfirm');
    const agreeTerms = watch('agreeTerms');
    const agreePrivacy = watch('agreePrivacy');

    // 단계 관리 훅
    const {
        currentStep,
        isEmailValid,
        isPasswordValid,
        isPasswordConfirmValid,
        isTermsValid,
        handleNextStep,
        handlePrevStep,
    } = useLoginSteps({
        email,
        password,
        passwordConfirm,
        agreeTerms,
        agreePrivacy,
        errors,
    });

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

            if (import.meta.env.DEV) console.log("=== 1단계 인증번호 발송 성공 ===");
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
                "인증번호 발송에 실패했습니다. 다시 시도해주세요.",
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-toss-blue-500 rounded-xl flex items-center justify-center">
                                <img
                                    src="/images/logo.png"
                                    alt="CARRY PORTER Logo"
                                    className={cn("w-6 h-6", logoError && "hidden")}
                                    onError={() => setLogoError(true)}
                                />
                            </div>
                            <h1 className="text-gray-900 text-lg font-bold">CARRY PORTER</h1>
                        </div>

                        {/* 뒤로가기 버튼 */}
                        {currentStep !== 'EMAIL' && (
                            <button
                                onClick={handlePrevStep}
                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-md mx-auto px-6 py-6">
                {/* 환영 메시지 */}
                <div className="mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        환영합니다! 👋
                    </h2>
                    <p className="text-gray-500">
                        편리한 짐 운반 서비스를 시작하세요
                    </p>
                </div>

                {/* 로그인 폼 카드 */}
                <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-up">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* 이메일 단계 */}
                        {currentStep === 'EMAIL' && (
                            <EmailInputStep
                                register={register}
                                errors={errors}
                                isValid={!!isEmailValid}
                                onNext={handleNextStep}
                            />
                        )}

                        {/* 비밀번호 단계 */}
                        {currentStep === 'PASSWORD' && (
                            <PasswordInputStep
                                register={register}
                                errors={errors}
                                isValid={!!isPasswordValid}
                                onNext={handleNextStep}
                                onBack={handlePrevStep}
                            />
                        )}

                        {/* 비밀번호 확인 단계 */}
                        {currentStep === 'PASSWORD_CONFIRM' && (
                            <PasswordConfirmStep
                                register={register}
                                errors={errors}
                                password={password || ''}
                                isValid={!!isPasswordConfirmValid}
                                onNext={handleNextStep}
                                onBack={handlePrevStep}
                            />
                        )}

                        {/* 약관 동의 단계 */}
                        {currentStep === 'TERMS' && (
                            <TermsAgreementStep
                                control={control}
                                errors={errors}
                                isValid={!!isTermsValid}
                                onSubmit={handleSubmit(onSubmit)}
                                onBack={handlePrevStep}
                                isLoading={isLoading}
                            />
                        )}

                        {/* API 에러 메시지 */}
                        {apiError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-600">{apiError}</p>
                                </div>
                            </div>
                        )}
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
