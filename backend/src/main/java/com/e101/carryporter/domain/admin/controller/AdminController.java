package com.e101.carryporter.domain.admin.controller;

import com.e101.carryporter.domain.admin.controller.dto.request.LockRequestDto;
import com.e101.carryporter.domain.admin.controller.dto.request.MoveRequestDto;
import com.e101.carryporter.domain.admin.controller.dto.request.UnlockRobotRequestDto;
import com.e101.carryporter.domain.robot.service.RobotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RobotService robotService;

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

    @PostMapping("/missions/{missionId}/move")
    public ResponseEntity<Void> move(@RequestBody @Valid MoveRequestDto requestDto,  @PathVariable Long missionId) {
        log.debug("관리자 권한 이동 요청 robot id = {}", requestDto.getRobotId());

        robotService.move(requestDto.toServiceRequestDto(missionId));
        return ResponseEntity.noContent().build();
    }

}
