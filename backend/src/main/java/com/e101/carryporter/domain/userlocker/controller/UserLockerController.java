package com.e101.carryporter.domain.userlocker.controller;

import com.e101.carryporter.domain.userlocker.controller.dto.response.LockerResponseDto;
import com.e101.carryporter.domain.userlocker.service.UserLockerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class UserLockerController {
    private final UserLockerService userLockerService;

    @GetMapping("/me/lockers")
    public ResponseEntity<List<LockerResponseDto>> getLockers(
            @RequestAttribute("userId") Long userId) {

        List<LockerResponseDto> responses = userLockerService.getMyLockerHistory(userId);
        return ResponseEntity.ok(responses);
    }
}
