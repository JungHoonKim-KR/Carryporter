import { Outlet } from 'react-router-dom'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'

/**
 * 메인 레이아웃 컴포넌트
 * - 사이드바 + 메인 컨텐츠 영역
 * - 테마 적용
 */
export default function MainLayout() {
    const { theme } = useThemeStore()

    // document에 light-mode 클래스 적용
    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode')
        } else {
            document.documentElement.classList.remove('light-mode')
        }
    }, [theme])

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-300",
        )}>
            {/* 사이드바 */}
            {/* <Sidebar /> */}

            {/* 메인 컨텐츠 */}
            <main className="min-h-screen">
                <Outlet />
            </main>
        </div>
    )
}
