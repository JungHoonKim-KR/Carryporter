package com.carryporter.carryporter.domain.mission.controller.dto.request;

import com.carryporter.carryporter.domain.mission.service.dto.requrest.CreateMissionServiceRequestDto;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateMissionRequestDto {

    @NotNull(message = "사용자 ID는 필수입니다.")
    private Long userId;

    @NotNull(message = "출발지 ID는 필수입니다.")
    private Long startLocationId;

    @NotNull(message = "도착지 ID는 필수입니다.")
    private Long endLocationId;

    public CreateMissionServiceRequestDto toServiceRequestDto(){
        return CreateMissionServiceRequestDto.builder()
                .userId(userId)
                .startLocationId(startLocationId)
                .endLocationId(endLocationId)
                .build();
    }
}
