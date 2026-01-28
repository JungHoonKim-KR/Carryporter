package com.e101.carryporter.global.filter;

import com.e101.carryporter.global.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    // 검사를 건너뛸 URL 목록 (로그인, 인증번호 요청 등)
    private static final List<String> WHITELIST = Arrays.asList(
            "/api/auth/request", // 인증번호 요청
            "/api/auth/verify"         // 로그인
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // 1. 화이트리스트에 있는 주소는 검사 안 하고 통과
        // (단순 포함 여부 확인, 더 정교하게 하려면 startsWith 등 사용)
        if (isWhitelisted(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. 헤더에서 토큰 꺼내기
        String token = resolveToken(request);

        // 3. 토큰 유효성 검사
        if (token != null && jwtUtils.validateToken(token)) {
            // 토큰이 유효하면 유저 정보를 request에 담아둠 (컨트롤러에서 쓰기 위해)
            String email = jwtUtils.getMmEmailFromToken(token);
            Long userId = jwtUtils.getUserIdFromToken(token);

            request.setAttribute("mmEmail", email);
            request.setAttribute("userId", userId);

            filterChain.doFilter(request, response); // 통과!
        } else {
            // 4. 토큰이 없거나 이상하면 401 에러 (진입 차단)
            log.info("유효하지 않은 토큰 접근: {}", requestURI);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "인증되지 않은 사용자입니다.");
        }
    }

    // Authorization 헤더에서 "Bearer " 떼고 토큰만 가져오는 메서드
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private boolean isWhitelisted(String uri) {
        return WHITELIST.stream().anyMatch(uri::startsWith);
    }
}