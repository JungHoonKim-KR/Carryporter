package com.e101.carryporter.domain.user.controller;

import com.e101.carryporter.domain.locker.service.LockerService;
import com.e101.carryporter.domain.locker.service.dto.response.UserLockersServiceResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class UserController {

    private final LockerService lockerService;

    @GetMapping("/me/lockers")
    public ResponseEntity<UserLockersServiceResponseDto> getUserLockers(@RequestAttribute("userId") Long userId) {
        log.debug("사용자 사물함 이용 내역 조회 userId = {}", userId);
        return ResponseEntity.ok(lockerService.getUserLockers(userId));
    }

}
