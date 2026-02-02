package com.e101.carryporter.global.filter;


import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // 가장 먼저 실행되어야 함
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // 프론트엔드 주소 허용 (모두 허용하려면 "*" 사용, 보안상 특정 주소를 적는 게 좋음)
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // 희정 프론트 로컬 용으로 해뒀어요 혹시 제가 원복을 안했다면, :3000 이런식으로 변경
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
        response.setHeader("Access-Control-Max-Age", "3600");

        // 브라우저가 보내는 사전 검사(OPTIONS) 요청은 바로 통과시킴
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }
}