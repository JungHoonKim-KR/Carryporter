package com.e101.carryporter.domain.sse.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SseEventName {
    // 공통
    CONNECT("connect"),           // 최초 연결 시

    // 사용자(User) 수신용
    REQUEST_RECEIVED("request_received"), // 로봇 요청 접수됨
    ROBOT_ASSIGNED("robot_assigned"),     // 로봇 배정 완료
    ROBOT_ARRIVED("robot_arrived"),       // 로봇 도착 (본인인증 활성화)
    DOOR_OPEN("door_open"),               // 문 열림 (잠금 해제)
    WEIGHT_UPDATE("weight_update"),       // 무게 실시간 변경(일단 넣어둠)

    // 관리자(Admin) 수신용
    NEW_REQUEST_ALERT("new_request_alert"), // 신규 로봇 요청 발생 알림
    SYSTEM_ERROR("system_error");           // 시스템 에러 알림

    private final String value;
}