package com.e101.carryporter.domain.userlocker.controller.dto.response;

import com.e101.carryporter.domain.userlocker.entity.UserLocker;
import com.e101.carryporter.domain.userlocker.entity.UserLockerStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class LockerResponseDto {
    private final Long lockerId;
    private final UserLockerStatus status;
    private final LocalDateTime updatedAt;

    @Builder
    private LockerResponseDto(Long lockerId, UserLockerStatus status, LocalDateTime updatedAt) {
        this.lockerId = lockerId;
        this.status = status;
        this.updatedAt = updatedAt;
    }

    // 엔티티에서 DTO로 바로 변환하는 정적 팩토리 메서드
    public static LockerResponseDto from(UserLocker userLocker) {
        return LockerResponseDto.builder()
                .lockerId(userLocker.getLocker().getId())
                .status(userLocker.getUserLockerStatus())
                .updatedAt(userLocker.getUpdatedAt())
                .build();
    }
}