package com.e101.carryporter.domain.mission.event;

public record MissionStartedEvent(
        Long missionId,
        String robotMac,
        Double destX,
        Double destY
) {
}
