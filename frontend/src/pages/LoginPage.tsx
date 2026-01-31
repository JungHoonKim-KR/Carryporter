import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { sendCodeSchema, type SendCodeFormData } from "../utils/validation";
import { sendCode } from "../api/auth.api";
import { setMockPassword } from "../api/mission.api.mock"; // Mock 비밀번호 저장용
import { useAuthStore } from "../store/authStore";

// 로그인 단계
type LoginStep = 'EMAIL' | 'PASSWORD' | 'PASSWORD_CONFIRM' | 'TERMS';

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, clearAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [currentStep, setCurrentStep] = useState<LoginStep>('EMAIL');

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
        mode: 'onChange', // 실시간 유효성 검사
    });

    // 폼 값 감시
    const email = watch('email');
    const password = watch('password');
    const passwordConfirm = watch('passwordConfirm');
    const agreeTerms = watch('agreeTerms');
    const agreePrivacy = watch('agreePrivacy');

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

    // Enter 키 처리
    const handleKeyPress = (e: React.KeyboardEvent, nextAction: () => void) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextAction();
        }
    };

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

            console.log("=== 1단계 인증번호 발송 성공 ===");
            console.log("응답 데이터:", response);

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
                                    className="w-6 h-6"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
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
                <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* MM 이메일 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Mattermost 이메일 <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="email"
                                placeholder="example@email.com"
                                className="h-12"
                                {...register("email")}
                                onKeyPress={(e) => handleKeyPress(e, handleNextStep)}
                                autoFocus
                            />
                            {errors.email?.message && (
                                <p className="text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* 비밀번호 - 이메일 입력 후 표시 */}
                        {(currentStep === 'PASSWORD' || currentStep === 'PASSWORD_CONFIRM' || currentStep === 'TERMS') && (
                            <div className="space-y-2 animate-slide-in-bottom">
                                <label className="block text-sm font-medium text-gray-700">
                                    비밀번호 <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="password"
                                    placeholder="숫자 4자리 입력"
                                    className="h-12"
                                    maxLength={4}
                                    {...register("password")}
                                    onKeyPress={(e) => handleKeyPress(e, handleNextStep)}
                                    autoFocus={currentStep === 'PASSWORD'}
                                />
                                {errors.password?.message && (
                                    <p className="text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>
                        )}

                        {/* 비밀번호 확인 - 비밀번호 입력 후 표시 */}
                        {(currentStep === 'PASSWORD_CONFIRM' || currentStep === 'TERMS') && (
                            <div className="space-y-2 animate-slide-in-bottom">
                                <label className="block text-sm font-medium text-gray-700">
                                    비밀번호 확인 <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="password"
                                    placeholder="비밀번호 재입력"
                                    className="h-12"
                                    maxLength={4}
                                    {...register("passwordConfirm")}
                                    onKeyPress={(e) => handleKeyPress(e, handleNextStep)}
                                    autoFocus={currentStep === 'PASSWORD_CONFIRM'}
                                />
                                {errors.passwordConfirm?.message && (
                                    <p className="text-sm text-red-600">{errors.passwordConfirm.message}</p>
                                )}
                            </div>
                        )}

                        {/* 약관 동의 - 비밀번호 확인 후 표시 */}
                        {currentStep === 'TERMS' && (
                            <div className="pt-2 space-y-4 animate-slide-in-bottom">
                                <div className="flex items-start space-x-3">
                                    <Controller
                                        name="agreeTerms"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id="agreeTerms"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <label
                                        htmlFor="agreeTerms"
                                        className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                                    >
                                        회수되지 않은 짐은 7일간 보관되는 것에 동의합니다. <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                {errors.agreeTerms?.message && (
                                    <p className="text-sm text-red-600 ml-7">{errors.agreeTerms.message}</p>
                                )}

                                <div className="flex items-start space-x-3">
                                    <Controller
                                        name="agreePrivacy"
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id="agreePrivacy"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <label
                                        htmlFor="agreePrivacy"
                                        className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                                    >
                                        서비스 이용약관 및 개인정보 처리 방침에 동의합니다. <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                {errors.agreePrivacy?.message && (
                                    <p className="text-sm text-red-600 ml-7">{errors.agreePrivacy.message}</p>
                                )}
                            </div>
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

                        {/* 로그인 버튼 - 모든 입력 완료 후 표시 */}
                        {currentStep === 'TERMS' && isTermsValid && (
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white mt-6 animate-slide-in-bottom"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        전송 중...
                                    </div>
                                ) : (
                                    "로그인"
                                )}
                            </Button>
                        )}
                    </form>
                </div>

                {/* 안내 텍스트 */}
                <p className="text-center text-sm text-gray-500 mt-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    가장 낮은 눈높이에서, 가장 높은 서비스를
                </p>
            </main>
        </div>
    );
};

export default LoginPage;
