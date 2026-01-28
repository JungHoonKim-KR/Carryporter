package com.e101.carryporter.domain.mission.controller;

import com.e101.carryporter.domain.mission.controller.dto.request.CreateMissionRequestDto;
import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.service.MissionService;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @PostMapping
    public ResponseEntity<Void> createMission(@RequestBody @Valid CreateMissionRequestDto requestDto, HttpServletRequest request) {
        Long userId = Long.valueOf(request.getParameter("userId"));

        log.debug("Create Mission Request: {}, userId = {}", requestDto, userId);
        missionService.createMission(userId, requestDto.toServiceRequestDto());

        return ResponseEntity.noContent().build();
    }
}
