package com.e101.carryporter.domain.mission.controller;

import com.e101.carryporter.domain.mission.controller.dto.request.CreateMissionRequestDto;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.service.MissionService;
import com.e101.carryporter.domain.user.entity.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @PostMapping
    public ResponseEntity<Void> createMission(@RequestBody @Valid CreateMissionRequestDto requestDto, @RequestAttribute("userId") Long userId, @RequestAttribute("role")Role role) {

        log.debug("Create Mission Request: {}, userId = {}, role = {}", requestDto, userId, role);
        missionService.createMission(userId, requestDto.toServiceRequestDto());

        return ResponseEntity.noContent().build();
    }
}
