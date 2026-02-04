package com.e101.carryporter.domain.mission.event;

public record MissionCreatedEvent(Long missionId, boolean isNew) {}