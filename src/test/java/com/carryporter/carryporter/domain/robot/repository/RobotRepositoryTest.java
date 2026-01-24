package com.carryporter.carryporter.domain.robot.repository;

import com.carryporter.carryporter.domain.robot.entity.Robot;
import com.carryporter.carryporter.domain.robot.entity.RobotStatus;
import com.carryporter.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class RobotRepositoryTest extends IntegrationTestSupport {

    @Autowired
    RobotRepository robotRepository;

    @Autowired
    EntityManager em;

    @DisplayName("로봇을 생성할 수 있다.")
    @Test
    void save() {
        // given
        Robot robot = createRobot();
        Long savedId = robotRepository.save(robot);

        flushAndClear();

        // when
        Robot findRobot = robotRepository.findById(savedId)
                .orElseThrow(EntityNotFoundException::new);

        // then
        assertThat(findRobot.getRobotCode()).isEqualTo(robot.getRobotCode());
        assertThat(findRobot.getRobotStatus()).isEqualTo(robot.getRobotStatus());
    }

    @DisplayName("없는 pk 로 로봇을 조회하면 빈 Optional 이 반환된다.")
    @Test
    void findByNotExistId() {
       // given
        Long notExistId = 99999L;

        // when
        Optional<Robot> findRobotOpt = robotRepository.findById(notExistId);

        // then
        assertThat(findRobotOpt).isEmpty();
    }

    private Robot createRobot() {
        return Robot.builder()
                .robotCode("test code")
                .robotStatus(RobotStatus.IDLE)
                .build();
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}