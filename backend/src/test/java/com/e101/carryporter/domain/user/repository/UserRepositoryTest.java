package com.e101.carryporter.domain.user.repository;

import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class UserRepositoryTest extends IntegrationTestSupport {

    @Autowired
    UserRepository userRepository;

    @Autowired
    EntityManager em;

    @DisplayName("일반 사용자를 저장할 수 있다.")
    @Test
    void saveBasicUser() {
        // given
        User user = User.createUser("test@mm.com");

        // when
        Long savedId = userRepository.save(user);
        flushAndClear();

        User findUser = userRepository.findById(savedId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // then
        assertThat(findUser.getMmEmail()).isEqualTo(user.getMmEmail());
    }

    @DisplayName("존재하지 않는 사용자의 pk 로 조회시 빈 옵셔널이 반환된다")
    @Test
    void findByNotExistId() {
        // given
        Long notExistUserId = 99999L;

        //  when
        Optional<User> userOpt = userRepository.findById(notExistUserId);

        // then
        assertThat(userOpt).isEmpty();
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }

}