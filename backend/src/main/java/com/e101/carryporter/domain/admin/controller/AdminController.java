package com.e101.carryporter.domain.admin.controller;

import com.e101.carryporter.domain.admin.controller.dto.request.*;
import com.e101.carryporter.domain.admin.controller.dto.response.LockerResponseDto;
import com.e101.carryporter.domain.admin.service.AdminLockerService;
import com.e101.carryporter.domain.admin.service.AdminService;
import com.e101.carryporter.domain.auth.controller.dto.response.TokenResponseDto;
import com.e101.carryporter.domain.robot.service.RobotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RobotService robotService;
    private final AdminService adminService;
    private final AdminLockerService adminLockerService;

    @PostMapping("/join")
    public ResponseEntity<Void> join(@RequestBody @Valid JoinRequestDto requestDto) {
        log.debug("관리자 계정 생성 요청, mmEmail = {}", requestDto.getMmEmail());
        adminService.join(requestDto.getMmEmail(), requestDto.getName(), requestDto.getPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@RequestBody @Valid LoginRequestDto requestDto) {
        log.debug("관리자 login 요청, mmEmail = {}", requestDto.getMmEmail());

        TokenResponseDto tokens = adminService.login(requestDto.getMmEmail(), requestDto.getPassword());

        // create refresh token cookie
        ResponseCookie refreshCookie = createRefreshTokenCookie(tokens.getRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(TokenResponseDto.builder()
                        .accessToken(tokens.getAccessToken())
                        .refreshToken(null) // 보안 이유로 refresh token 을 header 로
                        .grantType("Bearer")
                        .expiresIn(tokens.getExpiresIn())
                        .build());
    }


    @PostMapping("/missions/{missionId}/unlock")
    public ResponseEntity<Void> unlockRobot(@RequestBody @Valid UnlockRobotRequestDto requestDto, @PathVariable Long missionId) {
        log.debug("관리자 권한 잠금 해제 요청 robot id = {}", requestDto.getRobotId());

        robotService.unlockByAdmin(missionId, requestDto.getRobotId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/missions/{missionId}/lock")
    public ResponseEntity<Void> lockRobot(@RequestBody @Valid LockRequestDto requestDto, @PathVariable Long missionId) {
        log.debug("관리자 권한 잠금 요청 robot id = {}", requestDto.getRobotId());

        robotService.lockByAdmin(missionId, requestDto.getRobotId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/missions/{missionId}/dispatch")
    public ResponseEntity<Void> dispatch(@RequestBody @Valid DispatchRequestDto requestDto, @PathVariable Long missionId) {
        log.debug("관리자 권한 이동 요청 robot id = {}", requestDto.getRobotId());

        robotService.move(requestDto.toServiceRequestDto(missionId));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/missions/{missionId}/finalize")
    public ResponseEntity<Void> finalize(@RequestBody @Valid FinalizeRequestDto requestDto, @PathVariable Long missionId) {
        log.debug("관리자 최종 점검 완료 - missionId: {}, robotId: {}", missionId, requestDto.getRobotId());

        robotService.finalizeMission(missionId, requestDto.getRobotId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/lockers")
    public ResponseEntity<List<LockerResponseDto>> getAllLockers() {
        log.debug("관리자 전체 사물함 조회 요청");

        List<LockerResponseDto> lockers = adminLockerService.getAllLockers();
        return ResponseEntity.ok(lockers);
    }

    @GetMapping("/lockers/{lockerId}")
    public ResponseEntity<LockerResponseDto> getLocker(@PathVariable Long lockerId) {
        log.debug("관리자 사물함 단건 조회 요청 - lockerId: {}", lockerId);

        LockerResponseDto locker = adminLockerService.getLocker(lockerId);
        return ResponseEntity.ok(locker);
    }

    private ResponseCookie createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .sameSite("None")
                .build();
    }

}
