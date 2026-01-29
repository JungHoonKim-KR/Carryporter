package com.e101.carryporter.domain.robot.repository;

import com.e101.carryporter.domain.robot.entity.Robot;
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

    public Optional<Robot> findById(Long robotId) {
        return Optional.ofNullable(em.find(Robot.class, robotId));
    }

    public Optional<Robot> findByMacAddress(String macAddress) {
        return em.createQuery("SELECT r FROM Robot r WHERE r.macAddress = :macAddress", Robot.class)
                .setParameter("macAddress", macAddress)
                .getResultStream()
                .findFirst();
    }
}
