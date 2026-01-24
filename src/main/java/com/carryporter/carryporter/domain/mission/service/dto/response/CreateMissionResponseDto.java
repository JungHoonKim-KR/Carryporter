package com.carryporter.carryporter.domain.mission.service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
public class CreateMissionResponseDto {

    private Long missionId;

    @Builder
    private CreateMissionResponseDto(Long missionId) {
        this.missionId = missionId;
    }
}
