package com.e101.carryporter.domain.mission.repository;

import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.entity.MissionStatus;
import com.e101.carryporter.domain.robot.entity.Robot;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MissionRepository {

    private final EntityManager em;

    public Long save(Mission mission) {
        em.persist(mission);
        return mission.getId();
    }

    public Optional<Mission> findById(Long missionId) {
        return Optional.ofNullable(em.find(Mission.class, missionId));
    }

    /**
     * 로봇의 특정 상태인 미션 조회
     */
    public Optional<Mission> findByRobotAndStatus(Robot robot, MissionStatus status) {
        List<Mission> results = em.createQuery(
                        "SELECT m FROM Mission m WHERE m.robot = :robot AND m.missionStatus = :status",
                        Mission.class)
                .setParameter("robot", robot)
                .setParameter("status", status)
                .getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    /**
     * 로봇의 진행 중인 미션 조회 (FINISHED 제외)
     */
    public Optional<Mission> findActiveByRobot(Robot robot) {
        List<Mission> results = em.createQuery(
                        "SELECT m FROM Mission m WHERE m.robot = :robot AND m.missionStatus != :finished ORDER BY m.createdAt DESC",
                        Mission.class)
                .setParameter("robot", robot)
                .setParameter("finished", MissionStatus.FINISHED)
                .setMaxResults(1)
                .getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    /**
     * 최근 미션 조회 (최대 limit 개수)
     */
    public List<Mission> findAllWithLimit(int limit) {
        return em.createQuery(
                        "SELECT m FROM Mission m ORDER BY m.createdAt DESC",
                        Mission.class)
                .setMaxResults(limit)
                .getResultList();
    }

    public List<Mission> findByUserId(Long userId) {
        return new ArrayList<>(em.createQuery("select m from Mission m where m.user.id = :userId", Mission.class)
                .setParameter("userId", userId)
                .getResultList());
    }
}
