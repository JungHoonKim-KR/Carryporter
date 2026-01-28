package com.e101.carryporter.domain.mission.event;

public record MissionStartedEvent(
        Long missionId,
        String robotMacAddress,
        Double destX,
        Double destY
) {
}
