package com.carryporter.carryporter.domain.user.service;

import com.carryporter.carryporter.domain.user.entity.User;
import com.carryporter.carryporter.domain.user.exception.UserErrorCode;
import com.carryporter.carryporter.domain.user.repository.UserRepository;
import com.carryporter.carryporter.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findById(Long userId){
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND_EXCEPTION));
    }
}
