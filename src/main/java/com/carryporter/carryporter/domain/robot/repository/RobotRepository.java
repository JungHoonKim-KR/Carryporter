package com.carryporter.carryporter.domain.robot.repository;

import com.carryporter.carryporter.domain.robot.entity.Robot;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class RobotRepository {

    private final EntityManager em;

    public Long save(Robot robot) {
        em.persist(robot);
        return robot.getId();
    }

    public Optional<Robot> findById(Long id) {
        return Optional.ofNullable(em.find(Robot.class, id));
    }
}
