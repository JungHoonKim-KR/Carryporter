package com.e101.carryporter.domain.admin.service;

import com.e101.carryporter.domain.admin.entity.AdminCredential;
import com.e101.carryporter.domain.admin.repository.AdminCredentialRepository;
import com.e101.carryporter.domain.auth.controller.dto.response.TokenResponseDto;
import com.e101.carryporter.domain.auth.repository.RefreshTokenRedisRepository;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.exception.UserErrorCode;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.global.exception.BusinessException;
import com.e101.carryporter.global.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static com.e101.carryporter.global.config.security.PasswordEncoderConfig.*;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final AdminCredentialRepository adminCredentialRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenRedisRepository refreshTokenRepository;

    @Transactional
    public Long join(String email, String name, String password) {
        log.debug("관리자 회원가입 요청: email = {} , name = {}", email, name);

        // password hashing
        String hashedPassword = passwordEncoder.encode(password);

        // validate duplicated email
        validateDuplicatedEmail(email);

        // validate duplicated username
        validateUserName(name);

        // create admin
        User admin = User.createAdminUser(email, name, hashedPassword);

        // save
        return userRepository.save(admin);
    }

    public TokenResponseDto login(String email, String password) {
        User findAdmin = userRepository.findByMmEmailWithAdminCredential(email)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        String hashedPassword = findAdmin.getAdminCredential().getPassword();

        if  (!passwordEncoder.matches(password, hashedPassword)) {
            throw new BusinessException(UserErrorCode.UNAUTHORIZED);
        }

        // generate tokens
        String accessToken = jwtUtils.createAccessToken(email, findAdmin.getId(), findAdmin.getRole());
        String refreshToken = jwtUtils.createRefreshToken(findAdmin.getId());

        // save refresh token to redis session store
        refreshTokenRepository.save(findAdmin.getId(), refreshToken);

        return TokenResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .grantType("Bearer")
                .expiresIn(jwtUtils.getAccessTokenValidityInSeconds())
                .build();
    }

    private void validateDuplicatedEmail(String email) {
        Optional<User> findUserOpt = userRepository.findByMmEmail(email);

        if (findUserOpt.isPresent()) {
            throw new BusinessException(UserErrorCode.DUPLICATED_USER_EMAIL);
        }
    }

    private void validateUserName(String userName) {
        Optional<AdminCredential> findAdminCredentialOpt = adminCredentialRepository.findByName(userName);

        if (findAdminCredentialOpt.isPresent()) {
            throw new BusinessException(UserErrorCode.DUPLICATED_ADMIN_NAME);
        }
    }

}
