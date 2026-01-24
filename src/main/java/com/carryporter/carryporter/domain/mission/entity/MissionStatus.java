package com.carryporter.carryporter.domain.mission.entity;

public enum MissionStatus {
    REQUESTED("사용자 호출 발생"),
    ASSIGNED("로봇이 미션에 배정된 상태"),
    MOVING("이동중인 상태"),
    ARRIVED("로봇이 목적지에 도착한 상태"),
    UNLOCKED("인증 성공 상태"),
    LOCKED("잠금 상태"),
    RETURNING("로봇 복귀 상태"),
    RETURNED("관리소에 로봇이 도착한 상태"),
    FINISHED("미션이 종료된 상태")
    ;

    private final String description;

    MissionStatus(String description) {
        this.description = description;
    }
}
