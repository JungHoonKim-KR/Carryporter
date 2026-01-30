package com.e101.carryporter.domain.userlocker.controller;

import com.e101.carryporter.domain.userlocker.controller.dto.response.LockerResponseDto;
import com.e101.carryporter.domain.userlocker.entity.UserLockerStatus;
import com.e101.carryporter.support.WebMvcTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserLockerControllerTest extends WebMvcTestSupport {

    @DisplayName("로그인한 사용자의 사물함 이용 내역 목록을 조회한다.")
    @Test
    void getMyLockers() throws Exception {
        // given
        // 1L 대신 anyLong()을 사용하여 어떤 userId가 들어와도 응답하도록 설정
        given(userLockerService.getMyLockerHistory(anyLong()))
                .willReturn(List.of(
                        LockerResponseDto.builder()
                                .lockerId(10L)
                                .status(UserLockerStatus.USING)
                                .updatedAt(LocalDateTime.now())
                                .build()
                ));

        // when & then
        mockMvc.perform(
                        get("/me/lockers")
                                .requestAttr("userId", 1L) // 여기서 넣어준 값이 컨트롤러 파라미터로 전달됨
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1)) // 이제 결과가 1이 됩니다.
                .andExpect(jsonPath("$[0].lockerId").value(10L));
    }
}