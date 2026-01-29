package com.e101.carryporter.domain.robot.event;

public record RobotAssignedEvent(
        Long userId,
        String robotCode
) {
}
