import { useEffect } from 'react';
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

    useEffect(() => {
        // 이미 초기화되었거나 인증된 상태면 스킵
        if (isInitialized || isAuthenticated) {
            if (!isInitialized) {
                setInitialized(true);
            }
            return;
        }

        // refreshToken이 없으면 초기화만 완료
        if (!refreshToken) {
            setInitialized(true);
            return;
        }

        // refreshToken으로 세션 복원 시도
        const restoreSession = async () => {
            try {
                const response = await reissue();
                setAccessToken(response.accessToken);
                setAuthenticated(true);
                setInitialized(true);
                console.log('세션 복원 성공');
            } catch (error) {
                console.error('세션 복원 실패:', error);
                // refreshToken이 만료된 경우 정리
                clearAuth();
                setInitialized(true);
            }
        };

        restoreSession();
    }, [refreshToken, isAuthenticated, isInitialized, setAccessToken, setAuthenticated, setInitialized, clearAuth]);

    return { isInitialized };
};
