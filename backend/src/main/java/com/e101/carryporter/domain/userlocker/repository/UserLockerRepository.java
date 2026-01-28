package com.e101.carryporter.domain.userlocker.repository;

import com.e101.carryporter.domain.userlocker.entity.UserLocker;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserLockerRepository {

    private final EntityManager em;

    public Long save(UserLocker userLocker) {
        em.persist(userLocker);
        return userLocker.getId();
    }

    public Optional<UserLocker> findById(Long userLockerId) {
        return Optional.ofNullable(em.find(UserLocker.class, userLockerId));
    }

}
