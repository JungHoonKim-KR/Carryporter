package com.e101.carryporter.domain.auth.requestdto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class VerifyCodeRequestDto {
    private String email;
    private Integer code;
}
