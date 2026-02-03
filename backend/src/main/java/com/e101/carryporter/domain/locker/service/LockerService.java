package com.e101.carryporter.domain.locker.service;

import com.e101.carryporter.domain.locker.service.dto.response.UserLockerServiceResponseDto;
import com.e101.carryporter.domain.locker.service.dto.response.UserLockersServiceResponseDto;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LockerService {

    private final MissionRepository missionRepository;

    public UserLockersServiceResponseDto getUserLockers(Long userId) {
        List<UserLockerServiceResponseDto> userLockers = missionRepository.findByUserId(userId)
                .stream()
                .map(m -> new UserLockerServiceResponseDto(
                        m.getLocker().getId(),
                        m.getUserLockerStatus(),
                        m.getLockerAssignedAt()))
                .toList();

        return new UserLockersServiceResponseDto(userLockers);
    }

}
