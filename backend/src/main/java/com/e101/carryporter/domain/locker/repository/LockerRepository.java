package com.e101.carryporter.domain.locker.repository;

import com.e101.carryporter.domain.locker.entity.Locker;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class LockerRepository {

    private final EntityManager em;

    public Long save(Locker locker) {
        em.persist(locker);
        return locker.getId();
    }

    public Optional<Locker> findById(Long lockerId) {
        return Optional.ofNullable(em.find(Locker.class, lockerId));
    }

}
