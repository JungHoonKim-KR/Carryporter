package com.e101.carryporter.domain.auth.responsedto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TokenResponseDto {
    private String accessToken;
    private String tokenType;
    private long expiresIn;


}
