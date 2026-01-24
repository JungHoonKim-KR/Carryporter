package com.carryporter.carryporter.domain.robot.entity;

public enum RobotStatus {
    IDLE("유휴 상태"),
    RESERVED("허미션에 배정되어 관리소에서 적재 대기 중인 상태"),
    MOVING("이동중인 상태"),
    WAITING_AUTH("목적지 도착 후 사용자의 본인 인증을 기대리는 상태"),
    LOADING("사용자가 짐을 긷거나 꺼내는 상태"),
    LOCKED("잠금된 상태"),
    RETURNING("사용자를 떠나 main station 으로 복귀하는 상태"),
    RETURNED("main station 에 도착한 상태"),
    ;

    private final String description;

    RobotStatus(String description) {
        this.description = description;
    }
}
