package com.e101.carryporter.domain.userlocker.entity;

public enum UserLockerStatus {

    USING("사용중"),
    COMPLETED("이용 종료")
    ;

    private String description;

    UserLockerStatus(String description) {
        this.description = description;
    }
}
