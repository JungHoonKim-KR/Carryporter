package com.e101.carryporter.domain.sse.listener;

import com.e101.carryporter.domain.mission.event.MissionAbortedEvent;
import com.e101.carryporter.domain.mission.event.MissionLockedEvent;
import com.e101.carryporter.domain.robot.event.RobotArrivalEvent;
import com.e101.carryporter.domain.sse.service.SseService;
import com.e101.carryporter.domain.user.event.UserAuthSuccessEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SseNotificationHandler {
    private final SseService sseService;
    /**
     * 로봇 도착 이벤트 듣기
     */
    @Async
    @EventListener
    public void robotArrivalHandle(RobotArrivalEvent event){

        sseService.sendToUser(event.userId(), "ARRIVED", "로봇이 도착했습니다.");
    }

    /**
     * 비밀번호 인증 성공 이벤트 듣기
     */
    @Async
    @EventListener
    public void userAuthSuccessHandle(UserAuthSuccessEvent event){
        sseService.sendToUser(event.userId(), "UNLOCKED", "인증 성공! 문이 열립니다.");
    }

    /**
     * 미션 중단 (실패 3회 등) 처리
     * - 상황: 비밀번호 3회 틀려서 로봇이 강제 복귀함
     * - 행동: 사용자 화면에 "실패했습니다" 띄우고 홈으로 보내야 함
     */
    @Async // 알림은 비동기로 빠르게 처리
    @EventListener
    public void missionAbortedHandle(MissionAbortedEvent event) {
        // 프론트엔드에서 "ABORTED"라는 이벤트를 받으면 -> "인증 횟수 초과! 로봇이 복귀합니다." 라는 팝업을 띄우도록 약속
        sseService.sendToUser(
                event.userId(),
                "ABORTED",
                "인증 실패 횟수를 초과하여 미션이 중단되었습니다."
        );
    }

    /**
     * 미션 잠금 (최종 완료) 처리
     * - 상황: 사용자가 짐을 꺼내고/넣고 문을 잠금
     * - 행동: "이용해 주셔서 감사합니다" 보여주고 종료
     */
    @Async
    @EventListener
    public void handleLocked(MissionLockedEvent event) {
        // 1. 마지막 작별 인사 전송
        sseService.sendToUser(
                event.userId(),
                "LOCKED",
                "이용해 주셔서 감사합니다. 안녕히 가세요!"
        );

        // 2. 잠시 후 연결 끊기 (바로 끊으면 메시지 전송 전에 끊길 수도 있으니 주의)
        // 보통은 클라이언트가 "LOCKED"를 받고 스스로 연결을 끊게 하는 것이 가장 좋지만,
        // 서버에서 확실하게 끊어주려면 아래 코드를 사용합니다.
        try {
            Thread.sleep(1000); // 1초 정도 여유를 줌 (선택사항)
            sseService.complete(event.userId()); //연결 종료!
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
