package com.carryporter.carryporter.domain.location.exception;

import com.carryporter.carryporter.global.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum LocationErrorCode implements ErrorCode {

    LOCATION_NOT_FOUND_EXCEPTION("해당 위치를 조회할 수 없습니다.", HttpStatus.NOT_FOUND),
    ;

    private final String message;
    private final HttpStatus httpStatus;
}
