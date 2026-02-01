package com.e101.carryporter.domain.robot.event;

public record RobotReturnedAdminEvent(
        Long userId,
        String robotCode,
        Long missionId,
//        String lockerCode,  // 관리자가 박스를 넣어야 할 대상 사물함 -> ENTITY 머지하면 주석 해제
        String message     // "로봇이 복귀했습니다. 박스를 사물함에 넣고 상태를 선택하세요."
) {}