package com.e101.carryporter.domain.userlocker.service;

import com.e101.carryporter.domain.userlocker.controller.dto.response.LockerResponseDto;
import com.e101.carryporter.domain.userlocker.repository.UserLockerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserLockerService {

    private final UserLockerRepository userLockerRepository;



    public List<LockerResponseDto> getMyLockerHistory(Long userId) {
        return userLockerRepository.findAllByUserId(userId).stream()
                .map(LockerResponseDto::from)
                .collect(Collectors.toList());
    }
}
