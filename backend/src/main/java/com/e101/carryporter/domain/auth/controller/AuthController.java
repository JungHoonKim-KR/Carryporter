package com.e101.carryporter.domain.auth.controller;

import com.e101.carryporter.domain.auth.requestdto.AuthRequestDto;
import com.e101.carryporter.domain.auth.requestdto.VerifyCodeRequestDto;
import com.e101.carryporter.domain.auth.responsedto.AuthResponseDto;
import com.e101.carryporter.domain.auth.responsedto.TokenResponseDto;
import com.e101.carryporter.domain.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 1단계: 인증번호 요청
     */
    @PostMapping("/request")
    public ResponseEntity<AuthResponseDto> requestAuth(@RequestBody AuthRequestDto requestDto) {
        AuthResponseDto response = authService.requestAuth(requestDto);
        return ResponseEntity.ok(response);
    }

    /**
     * 2단계: 인증번호 검증 및 토큰 발급
     */
    @PostMapping("/verify")
    public ResponseEntity<TokenResponseDto> verifyAuth(@RequestBody VerifyCodeRequestDto requestDto) {
        TokenResponseDto tokenResponse = authService.verifyAuth(requestDto);
        return ResponseEntity.ok(tokenResponse);
    }

    @PostMapping("/reissue")
    public ResponseEntity<TokenResponseDto> reissue(@RequestHeader("Authorization-Refresh") String refreshToken) {
        // 보통 "Bearer " 접두사를 떼고 전달받음
        String token = refreshToken.replace("Bearer ", "");
        return ResponseEntity.ok(authService.reissue(token));
    }
}