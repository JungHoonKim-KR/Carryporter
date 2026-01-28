package com.e101.carryporter.domain.user.event;

public record UserAuthFailedEvent(
        Long missionId,
        int failCount
) {
    //잠시 메모용 주석입니당 개발 하면서 삭제할게욥!!
    //비밀번호 인증 실패를 하면 듣는건 ? -> 실패횟수 체크 핸들러(FailureCountHandler)
    // FailureCountHandler : 몇번째 틀렸어? -> failCount 필요
    // 어떤 미션이야? -> missionId 필요
}
