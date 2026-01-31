package com.e101.carryporter.domain.admin.service;

import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.e101.carryporter.global.config.security.PasswordEncoderConfig.*;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public Long join(String email, String name, String password) {
        log.debug("관리자 회원가입 요청: email = {} , name = {}", email, name);

        // password hashing
        String hashedPassword = passwordEncoder.encode(password);

        // create admin
        User admin = User.createAdminUser(email, name, hashedPassword);

        // save
        return userRepository.save(admin);
    }

}
