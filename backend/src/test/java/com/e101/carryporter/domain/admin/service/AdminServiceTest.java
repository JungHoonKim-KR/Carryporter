package com.e101.carryporter.domain.admin.service;

import com.e101.carryporter.domain.user.entity.Role;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.exception.UserErrorCode;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.global.exception.BusinessException;
import com.e101.carryporter.support.IntegrationTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static com.e101.carryporter.global.config.security.PasswordEncoderConfig.BCryptPasswordEncoder;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AdminServiceTest extends IntegrationTestSupport {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @DisplayName("관리자 계정을 생성하고 DB에 정상적으로 저장된다")
    @Test
    void join() {
        // given
        String email = "admin@mattermost.com";
        String name = "관리자";
        String password = "password123!";

        // when
        Long savedUserId = adminService.join(email, name, password);

        // then
        User savedUser = userRepository.findById(savedUserId).orElseThrow();

        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getMmEmail()).isEqualTo(email);
        assertThat(savedUser.getRole()).isEqualTo(Role.ADMIN);
        assertThat(savedUser.isAdmin()).isTrue();
    }

    @DisplayName("관리자 계정 생성 시 비밀번호가 암호화되어 저장된다")
    @Test
    void joinWithPasswordEncoding() {
        // given
        String email = "admin@mattermost.com";
        String name = "관리자";
        String rawPassword = "password123!";

        // when
        Long savedUserId = adminService.join(email, name, rawPassword);

        // then
        User savedUser = userRepository.findById(savedUserId).orElseThrow();

        assertThat(savedUser.getAdminCredential()).isNotNull();
        assertThat(savedUser.getAdminCredential().getName()).isEqualTo(name);

        String encodedPassword = savedUser.getAdminCredential().getPassword();
        assertThat(encodedPassword).isNotEqualTo(rawPassword);
        assertThat(passwordEncoder.matches(rawPassword, encodedPassword)).isTrue();
    }

    @DisplayName("관리자 계정 생성 시 AdminCredential이 함께 생성된다")
    @Test
    void joinCreatesAdminCredential() {
        // given
        String email = "admin@mattermost.com";
        String name = "관리자";
        String password = "password123!";

        // when
        Long savedUserId = adminService.join(email, name, password);

        // then
        User savedUser = userRepository.findById(savedUserId).orElseThrow();

        assertThat(savedUser.getAdminCredential()).isNotNull();
        assertThat(savedUser.getAdminCredential().getUser()).isEqualTo(savedUser);
        assertThat(savedUser.getAdminCredential().getName()).isEqualTo(name);
        assertThat(savedUser.getAdminCredential().getId()).isEqualTo(savedUser.getId());
    }

    @DisplayName("관리자 계정은 mmEmail로 조회할 수 있다")
    @Test
    void joinAndFindByEmail() {
        // given
        String email = "admin@mattermost.com";
        String name = "관리자";
        String password = "password123!";

        // when
        adminService.join(email, name, password);

        // then
        User foundUser = userRepository.findByMmEmail(email).orElseThrow();

        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getMmEmail()).isEqualTo(email);
        assertThat(foundUser.getRole()).isEqualTo(Role.ADMIN);
        assertThat(foundUser.getAdminCredential()).isNotNull();
        assertThat(foundUser.getAdminCredential().getName()).isEqualTo(name);
    }

    @DisplayName("중복된 이메일로 관리자 계정 생성 시 예외가 발생한다")
    @Test
    void joinWithDuplicatedEmail() {
        // given
        String email = "admin@mattermost.com";
        String name1 = "관리자1";
        String name2 = "관리자2";
        String password = "password123!";

        adminService.join(email, name1, password);

        // when & then
        assertThatThrownBy(() -> adminService.join(email, name2, password))
                .isInstanceOf(BusinessException.class)
                .hasMessage(UserErrorCode.DUPLICATED_USER_EMAIL.getMessage())
                .extracting("errorCode")
                .isEqualTo(UserErrorCode.DUPLICATED_USER_EMAIL);
    }

    @DisplayName("중복된 이름으로 관리자 계정 생성 시 예외가 발생한다")
    @Test
    void joinWithDuplicatedName() {
        // given
        String email1 = "admin1@mattermost.com";
        String email2 = "admin2@mattermost.com";
        String name = "관리자";
        String password = "password123!";

        adminService.join(email1, name, password);

        // when & then
        assertThatThrownBy(() -> adminService.join(email2, name, password))
                .isInstanceOf(BusinessException.class)
                .hasMessage(UserErrorCode.DUPLICATED_ADMIN_NAME.getMessage())
                .extracting("errorCode")
                .isEqualTo(UserErrorCode.DUPLICATED_ADMIN_NAME);
    }

    @DisplayName("중복된 이메일 검증은 이메일로만 확인하고 이름이 달라도 예외가 발생한다")
    @Test
    void validateDuplicatedEmailOnly() {
        // given
        String email = "admin@mattermost.com";
        String name1 = "관리자1";
        String name2 = "관리자2";
        String password = "password123!";

        adminService.join(email, name1, password);

        // when & then
        assertThatThrownBy(() -> adminService.join(email, name2, password))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(UserErrorCode.DUPLICATED_USER_EMAIL);
    }

    @DisplayName("중복된 이름 검증은 이름으로만 확인하고 이메일이 달라도 예외가 발생한다")
    @Test
    void validateDuplicatedNameOnly() {
        // given
        String email1 = "admin1@mattermost.com";
        String email2 = "admin2@mattermost.com";
        String name = "관리자";
        String password = "password123!";

        adminService.join(email1, name, password);

        // when & then
        assertThatThrownBy(() -> adminService.join(email2, name, password))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(UserErrorCode.DUPLICATED_ADMIN_NAME);
    }
}
