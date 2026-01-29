package com.e101.carryporter.domain.admin.controller.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;

@Getter
public class UnlockRobotRequestDto {

    @Min(value = 0, message = "0 이상의 수를 넣을 수 있습니다.")
    private Long robotId;


}
