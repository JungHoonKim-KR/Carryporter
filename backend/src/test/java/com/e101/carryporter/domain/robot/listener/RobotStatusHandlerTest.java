package com.e101.carryporter.domain.robot.listener;

import com.e101.carryporter.domain.mission.event.MissionFinalizedEvent;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.entity.RobotStatus;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;

import static org.assertj.core.api.Assertions.assertThat;

class RobotStatusHandlerTest extends IntegrationTestSupport {

    @Autowired
    RobotRepository robotRepository;

    @Autowired
    RobotStatusHandler robotStatusHandler;

    @Autowired
    ApplicationEventPublisher eventPublisher;

    @Autowired
    EntityManager em;

    @DisplayName("MissionFinalizedEvent를 처리하면 로봇 상태가 IDLE로 변경된다")
    @Test
    void handleMissionFinalized() {
        // given
        Robot robot = Robot.createRobot("R-001", "AA:BB:CC:DD:EE:FF");
        robotRepository.save(robot);
        robot.changeStatus(RobotStatus.IDLE);
        flushAndClear();

        MissionFinalizedEvent event = new MissionFinalizedEvent(1L, robot.getId());

        // when
        robotStatusHandler.handleMissionFinalized(event);
        flushAndClear();

        // then
        Robot findRobot = robotRepository.findById(robot.getId()).orElseThrow();
        assertThat(findRobot.getRobotStatus()).isEqualTo(RobotStatus.IDLE);
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}
