package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.global.exception.BusinessException;
import com.e101.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RobotServiceTest extends IntegrationTestSupport {

    @Autowired
    RobotRepository robotRepository;

    @Autowired
    RobotService robotService;

    @Autowired
    EntityManager em;

    @DisplayName("로봇을 pk 기반으로 조회할 수 있다.")
    @Test
    void findById() {
        // given
        Robot robot = Robot.createRobot("test code", "aa:bb:cc");
        robotRepository.save(robot);

        flushAndClear();

        // when
        Robot findRobot = robotService.findById(robot.getId());

        // then
        assertThat(findRobot.getRobotCode()).isEqualTo(robot.getRobotCode());
        assertThat(findRobot.getMacAddress()).isEqualTo(robot.getMacAddress());

    }
    @DisplayName("로봇이 없을 경우 예외가 발생한다.")
    @Test
    void findByNotExistsRobotId() {
        // given
        Long notExistsRobotId = 9999L;

        // when then
        assertThatThrownBy(() -> robotService.findById(notExistsRobotId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("해당 로봇을 찾을 수 없습니다.");

    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }

}