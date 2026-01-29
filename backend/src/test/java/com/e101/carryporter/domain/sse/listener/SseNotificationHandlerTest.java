package com.e101.carryporter.domain.sse.listener;

import com.e101.carryporter.domain.mission.event.MissionAbortedEvent;
import com.e101.carryporter.domain.mission.event.MissionLockedEvent;
import com.e101.carryporter.domain.robot.event.RobotArrivalEvent;
import com.e101.carryporter.domain.sse.service.SseService;
import com.e101.carryporter.domain.user.event.UserAuthSuccessEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) // Mockito 기능을 활성화합니다.
class SseNotificationHandlerTest {

    @Mock
    private SseService sseService; // 가짜(Mock) SSE 서비스

    @InjectMocks
    private UserSseNotificationHandler sseNotificationHandler; // 테스트 대상 (가짜 서비스를 주입받음)

    // 테스트용 상수
    private final Long USER_ID = 100L;
    private final Long MISSION_ID = 1L;
    private final String MAC_ADDRESS = "AA:BB:CC:DD:EE";

    @Test
    @DisplayName("로봇 도착 이벤트를 받으면 SSE로 'ARRIVED' 메시지를 전송해야 한다")
    void handleRobotArrival() {
        // given
        RobotArrivalEvent event = new RobotArrivalEvent(MISSION_ID, USER_ID);

        // when
        sseNotificationHandler.handleRobotArrivalEvent(event);

        // then
        // sseService.sendToUser 메서드가 정확한 파라미터로 호출되었는지 검증
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("ARRIVED"),
                contains("도착") // 메시지 내용에 "도착"이 포함되어 있는지 확인
        );
    }

    @Test
    @DisplayName("비밀번호 인증 성공 이벤트를 받으면 SSE로 'UNLOCKED' 메시지를 전송해야 한다")
    void handleUserAuthSuccess() {
        // given
        UserAuthSuccessEvent event = new UserAuthSuccessEvent(MISSION_ID, USER_ID, MAC_ADDRESS);

        // when
        sseNotificationHandler.handleUserAuthSuccessEvent(event);

        // then
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("UNLOCKED"),
                contains("성공")
        );
    }

    @Test
    @DisplayName("미션 중단(Aborted) 이벤트를 받으면 SSE로 'ABORTED' 메시지를 전송해야 한다")
    void handleMissionAborted() {
        // given
        // 생성자는 실제 코드에 맞게 수정 필요 (Reason 필드가 있다고 가정)
        MissionAbortedEvent event = new MissionAbortedEvent(MISSION_ID, USER_ID, MAC_ADDRESS, "비밀번호 3회 오류");

        // when
        sseNotificationHandler.handleMissionAborted(event);

        // then
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("ABORTED"),
                contains("중단")
        );
    }

    @Test
    @DisplayName("미션 잠금(Locked) 이벤트를 받으면 SSE로 'LOCKED' 메시지를 전송해야 한다")
    void handleMissionLocked() {
        // given
        // 로봇이 복귀할 필요가 없는 상황이라면 macAddress가 없을 수도 있지만,
        // 이벤트 객체 생성자에 맞춰 넣어주면 됩니다.
        MissionLockedEvent event = new MissionLockedEvent(MISSION_ID, USER_ID, MAC_ADDRESS);

        // when
        sseNotificationHandler.handleMissionLockedEvent(event);

        // then
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("LOCKED"),
                contains("감사합니다")
        );
    }
}
