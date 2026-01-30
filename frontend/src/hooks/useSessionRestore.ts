import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { reissue } from '../api/auth.api';

/**
 * 앱 시작 시 세션 복원을 처리하는 훅
 *
 * 동작 원리:
 * 1. localStorage에서 refreshToken 확인
 * 2. refreshToken이 있으면 /api/auth/reissue 호출
 * 3. 성공: 새 accessToken 저장 → isAuthenticated = true
 * 4. 실패: refreshToken 삭제 → isAuthenticated = false
 */
export const useSessionRestore = () => {
    const {
        refreshToken,
        isAuthenticated,
        isInitialized,
        setAccessToken,
        setAuthenticated,
        setInitialized,
        clearAuth,
    } = useAuthStore();

    // 세션 복원 시도 여부 추적 (무한 루프 방지)
    const isRestoringRef = useRef(false);

    useEffect(() => {
        // 이미 초기화된 경우 스킵
        if (isInitialized) {
            return;
        }

        // 이미 인증된 상태면 초기화만 완료
        if (isAuthenticated) {
            setInitialized(true);
            return;
        }

        // 이미 복원 시도 중이면 스킵 (중복 호출 방지)
        if (isRestoringRef.current) {
            return;
        }

        // refreshToken이 없으면 초기화만 완료
        if (!refreshToken) {
            setInitialized(true);
            return;
        }

        // 복원 시도 시작
        isRestoringRef.current = true;

        // refreshToken으로 세션 복원 시도
        const restoreSession = async () => {
            try {
                const response = await reissue();
                setAccessToken(response.accessToken);
                setAuthenticated(true);
                console.log('세션 복원 성공');
            } catch (error) {
                console.error('세션 복원 실패:', error);
                // refreshToken이 만료된 경우 정리
                clearAuth();
            } finally {
                setInitialized(true);
                isRestoringRef.current = false;
            }
        };

        restoreSession();
        // isAuthenticated를 의존성에서 제거하여 무한 루프 방지
    }, [refreshToken, isInitialized, setAccessToken, setAuthenticated, setInitialized, clearAuth]);

    return { isInitialized };
};
