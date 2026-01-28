package com.e101.carryporter.domain.mission.event;

public record ReturnStartedEvent(
        Long missionId,
        String robotMacAddress,
        Double homeX,
        Double homeY
) {
}
