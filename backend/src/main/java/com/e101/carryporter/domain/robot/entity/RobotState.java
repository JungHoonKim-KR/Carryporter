package com.e101.carryporter.domain.robot.entity;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RobotState {

    private String macAddress;
    private RobotStatus status;
    private int battery;
    private LocalDateTime updateAt;

    public static RobotState of(String macAddress, RobotStatus status, int battery) {
        return RobotState.builder()
                .macAddress(macAddress)
                .status(status)
                .battery(battery)
                .updateAt(LocalDateTime.now())
                .build();
    }

    @Builder
    private RobotState(String macAddress, RobotStatus status, int battery, LocalDateTime updateAt) {
        this.macAddress = macAddress;
        this.status = status;
        this.battery = battery;
        this.updateAt = updateAt;
    }
}
