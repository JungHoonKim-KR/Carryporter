package com.carryporter.carryporter.domain.mission.controller;

import com.carryporter.carryporter.domain.mission.controller.dto.request.CreateMissionRequestDto;
import com.carryporter.carryporter.domain.mission.service.MissionService;
import com.carryporter.carryporter.domain.mission.service.dto.response.CreateMissionResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @PostMapping
    public ResponseEntity<CreateMissionResponseDto> createMission(@Valid @RequestBody CreateMissionRequestDto request) {
        return ResponseEntity.ok(missionService.createMission(request.toServiceRequestDto()));
    }

}
