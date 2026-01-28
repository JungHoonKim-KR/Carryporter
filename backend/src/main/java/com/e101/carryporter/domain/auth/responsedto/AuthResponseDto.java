package com.e101.carryporter.domain.auth.responsedto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
public class AuthResponseDto {
    private String status;
    private String message;
    private long expiresIn;
}
