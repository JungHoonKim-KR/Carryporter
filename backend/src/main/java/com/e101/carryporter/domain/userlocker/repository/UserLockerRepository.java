package com.e101.carryporter.domain.userlocker.repository;

import com.e101.carryporter.domain.userlocker.entity.UserLocker;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    // 사용자의 보관 목록 전체 조회를 위해 추가
    public List<UserLocker> findAllByUserId(Long userId) {
        return em.createQuery(
                        "select ul from UserLocker ul " +
                                "join fetch ul.locker l " + // 페치 조인으로 성능 최적화
                                "where ul.user.id = :userId", UserLocker.class)
                .setParameter("userId", userId)
                .getResultList();
    }

}
