package com.e101.carryporter.domain.admin.controller;

import com.e101.carryporter.domain.admin.controller.dto.request.UnlockRobotRequestDto;
import com.e101.carryporter.domain.robot.service.RobotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RobotService robotService;

    @PostMapping("/unlock")
    public ResponseEntity<Void> unlockRobot(@RequestBody @Valid UnlockRobotRequestDto requestDto) {
        log.debug("관리자 권한 잠금 해제 요청 robot id = {}", requestDto.getRobotId());

        robotService.unlockByAdmin(requestDto.getMissionId(), requestDto.getRobotId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/lock")
    public ResponseEntity<Void> lockRobot(@RequestBody @Valid UnlockRobotRequestDto requestDto) {
        log.debug("관리자 권한 잠금 요청 robot id = {}", requestDto.getRobotId());

        robotService.lockByAdmin(requestDto.getMissionId(), requestDto.getRobotId());
        return ResponseEntity.noContent().build();
    }

}
