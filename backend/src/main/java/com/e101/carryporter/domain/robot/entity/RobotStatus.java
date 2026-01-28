package com.e101.carryporter.domain.robot.entity;

public enum RobotStatus {
    IDLE("대기 중 (미션 수행 가능)"),
    RESERVED("미션 배정 및 적재 대기 중"),
    MOVING("목적지로 이동 중"),
    WAITING_AUTH("목적지 도착 후 사용자 인증 대기 중"),
    LOADING("수하물 적재 및 하차 작업 중"),
    LOCKED("시스템 잠금 및 비상 정지 상태"),
    RETURNING("스테이션으로 복귀 중"),
    RETURNED("스테이션 복귀 완료"),
    OFFLINE("오프라인")
    ;

    private final String description;

    RobotStatus(String description) {
        this.description = description;
    }
}
