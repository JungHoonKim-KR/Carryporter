package com.carryporter.carryporter.domain.mission.repository;

import com.carryporter.carryporter.domain.mission.entity.Mission;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

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

}
