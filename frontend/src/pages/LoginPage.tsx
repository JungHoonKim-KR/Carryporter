import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { sendCodeSchema, type SendCodeFormData } from "../utils/validation";
import { sendCode } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, clearAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    // 로그인 페이지 진입 시 기존 인증 정보 클리어
    // (뒤로가기로 왔을 때 처음부터 다시 시작하도록)
    useEffect(() => {
        // 이미 인증 해제된 상태면 스킵 (무한 루프 방지)
        if (isAuthenticated) {
            clearAuth();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 마운트 시 1회만 실행 - clearAuth를 의존성에서 제외

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<SendCodeFormData>({
        resolver: zodResolver(sendCodeSchema),
    });

    const onSubmit = async (data: SendCodeFormData) => {
        try {
            setIsLoading(true);
            setApiError("");

            // 인증번호 발송 API 호출
            const response = await sendCode({
                email: data.email,
                password: parseInt(data.password, 10), // string을 number로 변환
            });

            console.log("=== 1단계 인증번호 발송 성공 ===");
            console.log("응답 데이터:", response);
            console.log(
                "받은 CODE:",
                response.code,
                "(type:",
                typeof response.code,
                ")",
            );

            // CODE 선택 페이지로 이동 (email, code 전달)
            navigate("/login/verify", {
                state: {
                    email: data.email,
                    code: response.code, // 실제 CODE 번호 (예: 35)
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
                            />
                            {errors.email?.message && (
                                <p className="text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* 비밀번호 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                비밀번호 <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="password"
                                placeholder="숫자 4자리 입력"
                                className="h-12"
                                maxLength={4}
                                {...register("password")}
                            />
                            {errors.password?.message && (
                                <p className="text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        {/* 비밀번호 확인 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                비밀번호 확인 <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="password"
                                placeholder="비밀번호 재입력"
                                className="h-12"
                                maxLength={4}
                                {...register("passwordConfirm")}
                            />
                            {errors.passwordConfirm?.message && (
                                <p className="text-sm text-red-600">{errors.passwordConfirm.message}</p>
                            )}
                        </div>

                        {/* 약관 동의 */}
                        <div className="pt-2 space-y-4">
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

                        {/* 로그인 버튼 */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 text-lg font-semibold bg-toss-blue-500 hover:bg-toss-blue-600 text-white mt-6"
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
                    </form>
                </div>

                {/* 안내 텍스트 */}
                <p className="text-center text-sm text-gray-500 mt-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    처음 이용하시나요? 회원가입 후 이용해주세요
                </p>
            </main>
        </div>
    );
};

export default LoginPage;
