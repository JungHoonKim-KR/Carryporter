package com.e101.carryporter.domain.admin.listener;

import com.e101.carryporter.domain.robot.event.RobotReturnedEvent;
import com.e101.carryporter.domain.sse.listener.AdminSseNotificationHandler;
import com.e101.carryporter.domain.sse.service.SseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminNotificationHandlerTest {

    @InjectMocks
    AdminSseNotificationHandler adminNotificationHandler;

    @Mock
    SseService sseService;

    @DisplayName("RobotReturnedEvent를 처리하면 관리자에게 SSE 알림이 전송된다")
    @Test
    void handleRobotIDLE() {
        // given
        Long missionId = 1L;
        Long robotId = 2L;
        String macAddress = "AA:BB:CC:DD:EE:FF";
        RobotReturnedEvent event = new RobotReturnedEvent(missionId, robotId, macAddress);

        // when
        adminNotificationHandler.handleRobotReturned(event);

        // then
        ArgumentCaptor<Map> dataCaptor = ArgumentCaptor.forClass(Map.class);
        verify(sseService).broadcastToAdmins(eq("ROBOT_IDLE"), dataCaptor.capture());

        Map<String, Object> capturedData = dataCaptor.getValue();
        assertThat(capturedData.get("missionId")).isEqualTo(missionId);
        assertThat(capturedData.get("robotId")).isEqualTo(robotId);
        assertThat(capturedData.get("message")).isEqualTo("로봇이 관리소에 도착했습니다. 최종 점검을 진행해주세요.");
    }
}
