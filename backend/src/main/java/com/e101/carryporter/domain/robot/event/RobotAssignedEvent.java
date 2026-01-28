package com.e101.carryporter.domain.robot.event;

public record RobotAssignedEvent(Long missionId, Long robotId, Long userId) {
}
