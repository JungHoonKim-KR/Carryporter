package com.e101.carryporter.domain.sse.listener;

import com.e101.carryporter.domain.mission.event.MissionAbortedEvent;
import com.e101.carryporter.domain.mission.event.MissionLockedEvent;
import com.e101.carryporter.domain.mission.event.MissionStartedEvent;
import com.e101.carryporter.domain.robot.event.RobotArrivalEvent;
import com.e101.carryporter.domain.robot.event.RobotAssignedEvent;
import com.e101.carryporter.domain.sse.service.SseService;
import com.e101.carryporter.domain.user.event.UserAuthSuccessEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserSseNotificationHandlerTest {

    @Mock
    private SseService sseService;

    @InjectMocks
    private UserSseNotificationHandler sseNotificationHandler;

    // 테스트용 상수
    private final Long USER_ID = 100L;
    private final Long MISSION_ID = 1L;
    private final String MAC_ADDRESS = "AA:BB:CC:DD:EE";
    private final String ROBOT_CODE = "R-001";

    @Test
    @DisplayName("로봇 배정 이벤트를 받으면 SSE로 'RobotAssignedEvent'와 메시지 맵을 전송해야 한다")
    void handleRobotAssigned() {
        // given
        RobotAssignedEvent event = new RobotAssignedEvent(USER_ID, ROBOT_CODE);

        // when
        sseNotificationHandler.handleRobotAssignedEvent(event);

        // then
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("RobotAssignedEvent"), // 클래스 이름 확인
                argThat(data -> isMapContainingMsg(data, "배정")) // Map 내부 msg 확인
        );
    }

    @Test
    @DisplayName("미션 시작 이벤트를 받으면 SSE로 'MissionStartedEvent'와 메시지 맵을 전송해야 한다")
    void handleMissionStarted() {
        // given
        // Record 구조에 맞춰 생성 (userId, missionId, robotCode, mac, x, y)
        MissionStartedEvent event = new MissionStartedEvent(USER_ID, MISSION_ID, ROBOT_CODE, MAC_ADDRESS, 0.0, 0.0);

        // when
        sseNotificationHandler.handleMissionStartedEvent(event);

        // then
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("MissionStartedEvent"),
                argThat(data -> isMapContainingMsg(data, "출발"))
        );
    }

    @Test
    @DisplayName("로봇 도착 이벤트를 받으면 SSE로 'RobotArrivalEvent'와 메시지 맵을 전송해야 한다")
    void handleRobotArrival() {
        // given
        RobotArrivalEvent event = new RobotArrivalEvent(MISSION_ID, USER_ID, ROBOT_CODE);

        // when
        sseNotificationHandler.handleRobotArrivalEvent(event);

        // then
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("RobotArrivalEvent"),
                argThat(data -> isMapContainingMsg(data, "도착"))
        );
    }

    @Test
    @DisplayName("비밀번호 인증 성공 이벤트를 받으면 SSE로 'UserAuthSuccessEvent'와 메시지 맵을 전송해야 한다")
    void handleUserAuthSuccess() {
        // given
        UserAuthSuccessEvent event = new UserAuthSuccessEvent(MISSION_ID, USER_ID, MAC_ADDRESS);

        // when
        sseNotificationHandler.handleUserAuthSuccessEvent(event);

        // then
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("UserAuthSuccessEvent"),
                argThat(data -> isMapContainingMsg(data, "성공"))
        );
    }

    @Test
    @DisplayName("미션 중단 이벤트를 받으면 SSE로 'MissionAbortedEvent'와 메시지 맵을 전송해야 한다")
    void handleMissionAborted() {
        // given
        MissionAbortedEvent event = new MissionAbortedEvent(MISSION_ID, USER_ID, MAC_ADDRESS, "Fail Reason");

        // when
        sseNotificationHandler.handleMissionAbortedEvent(event);

        // then
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("MissionAbortedEvent"),
                argThat(data -> isMapContainingMsg(data, "중단"))
        );
    }

    @Test
    @DisplayName("미션 잠금 이벤트를 받으면 SSE로 'MissionLockedEvent'와 메시지 맵을 전송해야 한다")
    void handleMissionLocked() {
        // given
        MissionLockedEvent event = new MissionLockedEvent(MISSION_ID, USER_ID, MAC_ADDRESS);

        // when
        sseNotificationHandler.handleMissionLockedEvent(event);

        // then
        verify(sseService).sendToUser(
                eq(USER_ID),
                eq("MissionLockedEvent"),
                argThat(data -> isMapContainingMsg(data, "감사합니다"))
        );
    }

    // 검증을 돕는 헬퍼 메서드 (Map 안에 특정 msg가 포함되어 있는지 확인)
    private boolean isMapContainingMsg(Object data, String expectedKeyword) {
        if (data instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) data;
            Object msg = map.get("msg");
            return msg != null && msg.toString().contains(expectedKeyword);
        }
        return false;
    }
}