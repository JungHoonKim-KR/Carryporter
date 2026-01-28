package com.e101.carryporter.domain.user.user;

import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.domain.user.exception.UserErrorCode;
import com.e101.carryporter.domain.user.repository.UserRepository;
import com.e101.carryporter.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
    }
}
