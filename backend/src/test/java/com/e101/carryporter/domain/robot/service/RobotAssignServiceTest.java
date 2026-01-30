package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.mission.service.MissionService;
import com.e101.carryporter.domain.robot.exception.RobotErrorCode;
import com.e101.carryporter.domain.robot.repository.RobotAvailableQueueRepository;
import com.e101.carryporter.global.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RobotAssignServiceTest {

    @Mock
    private RobotAvailableQueueRepository queueRepository;

    @Mock
    private MissionService missionService;

    @InjectMocks
    private RobotAssignService robotAssignService;

    @Nested
    @DisplayName("로봇 배정")
    class AssignRobotToMissionTest {

        @DisplayName("가용 로봇이 있으면 미션에 로봇을 배정한다")
        @Test
        void assignRobotToMissionSuccess() {
            // given
            Long missionId = 1L;
            Long robotId = 10L;

            given(queueRepository.acquireRobotId()).willReturn(Optional.of(robotId));
            doNothing().when(missionService).assignRobot(missionId, robotId);

            // when
            Long result = robotAssignService.assignRobotToMission(missionId);

            // then
            assertThat(result).isEqualTo(robotId);

            then(queueRepository).should(times(1)).acquireRobotId();
            then(missionService).should(times(1)).assignRobot(missionId, robotId);
            then(queueRepository).should(never()).returnRobotToQueue(anyLong());
        }

        @DisplayName("가용 로봇이 없으면 ROBOT_NOT_AVAILABLE 예외가 발생한다")
        @Test
        void assignRobotToMissionNoAvailableRobot() {
            // given
            Long missionId = 1L;

            given(queueRepository.acquireRobotId()).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> robotAssignService.assignRobotToMission(missionId))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage(RobotErrorCode.ROBOT_NOT_AVAILABLE.getMessage());

            then(queueRepository).should(times(1)).acquireRobotId();
            then(missionService).should(never()).assignRobot(anyLong(), anyLong());
            then(queueRepository).should(never()).returnRobotToQueue(anyLong());
        }

        @DisplayName("미션 할당 중 예외가 발생하면 로봇을 큐에 반환한다")
        @Test
        void assignRobotToMissionRollbackOnException() {
            // given
            Long missionId = 1L;
            Long robotId = 10L;

            given(queueRepository.acquireRobotId()).willReturn(Optional.of(robotId));
            doThrow(new RuntimeException("Mission assignment failed"))
                    .when(missionService).assignRobot(missionId, robotId);

            // when & then
            assertThatThrownBy(() -> robotAssignService.assignRobotToMission(missionId))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Mission assignment failed");

            then(queueRepository).should(times(1)).acquireRobotId();
            then(missionService).should(times(1)).assignRobot(missionId, robotId);
            then(queueRepository).should(times(1)).returnRobotToQueue(robotId);
        }

        @DisplayName("미션 할당 중 BusinessException이 발생하면 로봇을 큐에 반환한다")
        @Test
        void assignRobotToMissionRollbackOnBusinessException() {
            // given
            Long missionId = 1L;
            Long robotId = 10L;
            BusinessException businessException = new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND);

            given(queueRepository.acquireRobotId()).willReturn(Optional.of(robotId));
            doThrow(businessException).when(missionService).assignRobot(missionId, robotId);

            // when & then
            assertThatThrownBy(() -> robotAssignService.assignRobotToMission(missionId))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage(RobotErrorCode.ROBOT_NOT_FOUND.getMessage());

            then(queueRepository).should(times(1)).acquireRobotId();
            then(missionService).should(times(1)).assignRobot(missionId, robotId);
            then(queueRepository).should(times(1)).returnRobotToQueue(robotId);
        }

        @DisplayName("로봇 배정 없이 예외가 발생하면 큐 반환을 시도하지 않는다")
        @Test
        void noRollbackWhenNoRobotAcquired() {
            // given
            Long missionId = 1L;

            given(queueRepository.acquireRobotId()).willReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> robotAssignService.assignRobotToMission(missionId))
                    .isInstanceOf(BusinessException.class);

            then(queueRepository).should(times(1)).acquireRobotId();
            then(missionService).should(never()).assignRobot(anyLong(), anyLong());
            then(queueRepository).should(never()).returnRobotToQueue(anyLong());
        }
    }

    @Nested
    @DisplayName("예외 처리 및 롤백 메커니즘")
    class ExceptionHandlingTest {

        @DisplayName("여러 번 호출해도 각각 독립적으로 처리된다")
        @Test
        void multipleCallsAreIndependent() {
            // given
            Long missionId1 = 1L;
            Long missionId2 = 2L;
            Long robotId1 = 10L;
            Long robotId2 = 20L;

            given(queueRepository.acquireRobotId())
                    .willReturn(Optional.of(robotId1))
                    .willReturn(Optional.of(robotId2));

            doNothing().when(missionService).assignRobot(anyLong(), anyLong());

            // when
            Long result1 = robotAssignService.assignRobotToMission(missionId1);
            Long result2 = robotAssignService.assignRobotToMission(missionId2);

            // then

            then(queueRepository).should(times(2)).acquireRobotId();
            then(missionService).should(times(1)).assignRobot(missionId1, robotId1);
            then(missionService).should(times(1)).assignRobot(missionId2, robotId2);
            then(queueRepository).should(never()).returnRobotToQueue(anyLong());
        }

        @DisplayName("첫 번째 호출은 성공하고 두 번째 호출은 실패하면 각각 독립적으로 처리된다")
        @Test
        void mixedSuccessAndFailure() {
            // given
            Long missionId1 = 1L;
            Long missionId2 = 2L;
            Long robotId1 = 10L;
            Long robotId2 = 20L;

            given(queueRepository.acquireRobotId())
                    .willReturn(Optional.of(robotId1))
                    .willReturn(Optional.of(robotId2));

            doNothing().when(missionService).assignRobot(missionId1, robotId1);
            doThrow(new RuntimeException("Failed")).when(missionService).assignRobot(missionId2, robotId2);

            // when
            Long result1 = robotAssignService.assignRobotToMission(missionId1);

            assertThatThrownBy(() -> robotAssignService.assignRobotToMission(missionId2))
                    .isInstanceOf(RuntimeException.class);

            // then

            then(queueRepository).should(times(2)).acquireRobotId();
            then(missionService).should(times(1)).assignRobot(missionId1, robotId1);
            then(missionService).should(times(1)).assignRobot(missionId2, robotId2);
            then(queueRepository).should(times(1)).returnRobotToQueue(robotId2);
            then(queueRepository).should(never()).returnRobotToQueue(robotId1);
        }

        @DisplayName("로봇 반환 중 예외가 발생하면 반환 실패 예외가 전파된다")
        @Test
        void returnRobotExceptionDoesNotSuppressOriginalException() {
            // given
            Long missionId = 1L;
            Long robotId = 10L;
            RuntimeException originalException = new RuntimeException("Original error");

            given(queueRepository.acquireRobotId()).willReturn(Optional.of(robotId));
            doThrow(originalException).when(missionService).assignRobot(missionId, robotId);
            doThrow(new RuntimeException("Return failed")).when(queueRepository).returnRobotToQueue(robotId);

            // when & then
            assertThatThrownBy(() -> robotAssignService.assignRobotToMission(missionId))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Return failed");

            then(queueRepository).should(times(1)).acquireRobotId();
            then(missionService).should(times(1)).assignRobot(missionId, robotId);
            then(queueRepository).should(times(1)).returnRobotToQueue(robotId);
        }
    }
}
