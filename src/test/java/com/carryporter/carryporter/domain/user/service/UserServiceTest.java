package com.carryporter.carryporter.domain.user.service;

import com.carryporter.carryporter.domain.user.entity.User;
import com.carryporter.carryporter.domain.user.repository.UserRepository;
import com.carryporter.carryporter.global.exception.BusinessException;
import com.carryporter.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserServiceTest extends IntegrationTestSupport {

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserService userService;

    @Autowired
    EntityManager em;

    @DisplayName("사용자를 조회할 수 있다.")
    @Test
    void findById() {

        // given
        User user = User.createBasicUser("test@mm.com");
        Long savedId = userRepository.save(user);

        flushAndClear();

        // when
        User findUser = userService.findById(savedId);

        // then
        assertThat(findUser.getMmEmail()).isEqualTo(user.getMmEmail());
    }

    @DisplayName("없는 사용자를 조회할 경우 예외가 발생한다.")
    @Test
    void findNotExistUser() {
        // given
        Long notExistId = 9999L;

        // when then
        assertThatThrownBy(() -> userService.findById(notExistId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("해당 사용자를 조회할 수 없습니다.");
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }

}