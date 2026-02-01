package com.e101.carryporter.global.filter;

import com.e101.carryporter.domain.user.entity.Role;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthorizationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    // 인가 검사를 건너뛸 URL 목록 (인증 관련 경로)
    private static final List<String> WHITELIST = Arrays.asList(
            "/auth/request",
            "/auth/verify",
            "/auth/reissue",
            "/api/auth/request",
            "/api/auth/verify",
            "/api/auth/reissue",


            "/api/test/sse",
            "/test/sse"
    );

    // 관리자 전용 URL 목록
    private static final List<String> ADMIN_ONLY_PATHS = Arrays.asList(
            "/admin",
            "/api/admin",
            "/admin/join",    // 관리자 회원가입
            "/admin/login"   // 관리자 로그인
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getServletPath();

        // 1. [최우선] 화이트리스트 및 '인증이 필요 없는 경로'는 바로 통과
        // 회원가입, 로그인은 토큰이 없으므로 여기서 바로 filterChain.doFilter를 타야 합니다.
        if (isWhitelisted(requestURI) || isPublicAdminPath(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. 인증 체크 (여기서부터는 로그인이 되어 있어야 함)
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            log.warn("❌ 인증 실패 - 로그인 정보 없음: uri={}", requestURI);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "로그인이 필요합니다.");
            return;
        }

        // 3. 인가 및 Role 설정 (인증된 유저 정보 조회)
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "사용자 정보를 찾을 수 없습니다.");
            return;
        }

        User user = userOptional.get();
        request.setAttribute("userRole", user.getRole());
        log.info("✅ 인가 성공 - userId: {}, role: {}, uri: {}", userId, user.getRole(), requestURI);

        // 4. 관리자 권한 필수 경로 체크 (로그인 이후의 관리자 기능들)
        if (isAdminOnlyPath(requestURI)) {
            if (!user.isAdmin()) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "관리자만 접근 가능합니다.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    // 회원가입, 로그인은 인증 없이 들어올 수 있게 분리
    private boolean isPublicAdminPath(String uri) {
        return uri.equals("/api/admin/join") || uri.equals("/api/admin/login")
                || uri.equals("/admin/join") || uri.equals("/admin/login");
    }
    private boolean isWhitelisted(String uri) {
        return WHITELIST.stream().anyMatch(uri::startsWith);
    }

    private boolean isAdminOnlyPath(String uri) {
        return ADMIN_ONLY_PATHS.stream().anyMatch(uri::startsWith);
    }
}
