package com.e101.carryporter.domain.robot.service;

import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.exception.RobotErrorCode;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class RobotService {

    private final RobotRepository robotRepository;

    public Robot findById(Long robotId) {
        return robotRepository.findById(robotId)
                .orElseThrow(() -> new BusinessException(RobotErrorCode.ROBOT_NOT_FOUND));
    }
}
