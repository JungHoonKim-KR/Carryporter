package com.e101.carryporter.domain.userlocker.repository;

import com.e101.carryporter.domain.locker.entity.Locker;
import com.e101.carryporter.domain.locker.repository.LockerRepository;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.domain.userlocker.entity.UserLocker;
import com.e101.carryporter.domain.userlocker.entity.UserLockerStatus;
import com.e101.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class UserLockerRepositoryTest extends IntegrationTestSupport {

    @Autowired
    UserLockerRepository userLockerRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    LockerRepository lockerRepository;

    @Autowired
    EntityManager em;

    @DisplayName("사용자 라커를 저장할 수 있다.")
    @Test
    void saveUserLocker() {
        // given
        User user = User.createUser("test@mm.com");
        userRepository.save(user);

        Locker locker = Locker.createLocker("A-001");
        lockerRepository.save(locker);

        UserLocker userLocker = UserLocker.builder()
                .user(user)
                .locker(locker)
                .userLockerStatus(UserLockerStatus.USING)
                .build();

        // when
        Long savedId = userLockerRepository.save(userLocker);
        flushAndClear();

        UserLocker findUserLocker = userLockerRepository.findById(savedId)
                .orElseThrow(() -> new EntityNotFoundException("UserLocker not found"));

        // then
        assertThat(findUserLocker.getUser().getId()).isEqualTo(user.getId());
        assertThat(findUserLocker.getLocker().getId()).isEqualTo(locker.getId());
        assertThat(findUserLocker.getUserLockerStatus()).isEqualTo(UserLockerStatus.USING);
    }

    @DisplayName("존재하지 않는 사용자 라커의 pk 로 조회시 빈 옵셔널이 반환된다")
    @Test
    void findByNotExistId() {
        // given
        Long notExistUserLockerId = 99999L;

        // when
        Optional<UserLocker> userLockerOpt = userLockerRepository.findById(notExistUserLockerId);

        // then
        assertThat(userLockerOpt).isEmpty();
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }

}
