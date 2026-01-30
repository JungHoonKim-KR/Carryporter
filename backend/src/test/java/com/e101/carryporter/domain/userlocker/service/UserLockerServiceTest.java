package com.e101.carryporter.domain.userlocker.service;

import com.e101.carryporter.domain.locker.entity.Locker;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.userlocker.controller.dto.response.LockerResponseDto;
import com.e101.carryporter.domain.userlocker.entity.UserLocker;
import com.e101.carryporter.domain.userlocker.entity.UserLockerStatus;
import com.e101.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UserLockerServiceTest extends IntegrationTestSupport {

    @Autowired
    private UserLockerService userLockerService;

    @Autowired
    private EntityManager em;

    @DisplayName("사용자의 사물함 보관 내역 리스트를 조회한다.")
    @Test
    @Transactional
    void getMyLockerHistory() {
        // given
        User user = User.createUser("tester@mm.com");
        em.persist(user);

        Locker locker1 = Locker.createLocker("LOCKER-001");
        Locker locker2 = Locker.createLocker("LOCKER-002");
        em.persist(locker1);
        em.persist(locker2);

        UserLocker userLocker1 = UserLocker.createUserLocker(user, locker1);
        UserLocker userLocker2 = UserLocker.createUserLocker(user, locker2);
        em.persist(userLocker1);
        em.persist(userLocker2);

        em.flush();
        em.clear();

        // when
        List<LockerResponseDto> result = userLockerService.getMyLockerHistory(user.getId());

        // then
        assertThat(result).hasSize(2);
        assertThat(result)
                .extracting("lockerId")
                .containsExactlyInAnyOrder(locker1.getId(), locker2.getId());
        assertThat(result.get(0).getStatus()).isEqualTo(UserLockerStatus.USING);
    }
}
