package com.carryporter.carryporter.domain.mission.service.dto.requrest;

import lombok.Builder;
import lombok.Data;

@Data
public class CreateMissionServiceRequestDto {

    private Long userId;
    private Long startLocationId;
    private Long endLocationId;

    @Builder
    private CreateMissionServiceRequestDto(Long userId, Long startLocationId, Long endLocationId) {
        this.userId = userId;
        this.startLocationId = startLocationId;
        this.endLocationId = endLocationId;
    }
}
