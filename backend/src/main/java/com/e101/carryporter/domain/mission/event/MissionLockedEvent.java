package com.e101.carryporter.domain.mission.event;

public record MissionLockedEvent(
        Long missionId,
        Long userId,
        String robotMac,
        Double homeX,
        Double homeY
) {
}
