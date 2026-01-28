package com.e101.carryporter.domain.auth.controller;

import com.e101.carryporter.domain.auth.controller.dto.request.AuthRequestDto;
import com.e101.carryporter.domain.auth.controller.dto.request.VerifyCodeRequestDto;
import com.e101.carryporter.domain.auth.controller.dto.response.AuthResponseDto;
import com.e101.carryporter.domain.auth.controller.dto.response.TokenResponseDto;
import com.e101.carryporter.domain.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 1단계: 인증번호 요청
     */
    @PostMapping("/request")
    public ResponseEntity<AuthResponseDto> requestAuth(@Valid @RequestBody AuthRequestDto requestDto) {
        AuthResponseDto response = authService.requestAuth(requestDto.toServiceRequestDto());
        return ResponseEntity.ok(response);
    }

    /**
     * 2단계: 인증번호 검증 및 토큰 발급
     */
    @PostMapping("/verify")
    public ResponseEntity<TokenResponseDto> verifyAuth(@Valid @RequestBody VerifyCodeRequestDto requestDto) {
        TokenResponseDto tokenResponse = authService.verifyAuth(requestDto.toServiceRequestDto());
        return ResponseEntity.ok(tokenResponse);
    }

    @PostMapping("/reissue")
    public ResponseEntity<TokenResponseDto> reissue(@RequestHeader("Authorization-Refresh") String refreshToken) {
        // 보통 "Bearer " 접두사를 떼고 전달받음
        String token = refreshToken.replace("Bearer ", "");
        return ResponseEntity.ok(authService.reissue(token));
    }
}