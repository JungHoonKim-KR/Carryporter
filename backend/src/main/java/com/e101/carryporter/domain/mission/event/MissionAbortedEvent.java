package com.e101.carryporter.domain.mission.event;

public record MissionAbortedEvent(
        Long missionId,
        String robotMac,
        Double homeX,
        Double homeY,
        String reason
) {
}
