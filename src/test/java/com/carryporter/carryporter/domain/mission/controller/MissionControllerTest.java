package com.carryporter.carryporter.domain.mission.controller;

import com.carryporter.carryporter.domain.location.exception.LocationErrorCode;
import com.carryporter.carryporter.domain.mission.controller.dto.request.CreateMissionRequestDto;
import com.carryporter.carryporter.domain.mission.service.dto.requrest.CreateMissionServiceRequestDto;
import com.carryporter.carryporter.domain.mission.service.dto.response.CreateMissionResponseDto;
import com.carryporter.carryporter.domain.user.exception.UserErrorCode;
import com.carryporter.carryporter.global.exception.BusinessException;
import com.carryporter.carryporter.support.WebMvcTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MissionControllerTest extends WebMvcTestSupport {

    @DisplayName("mission 을 정상적으로 생성하면 200 응답을 반환한다.")
    @Test
    void createMission() throws Exception {

        // given
        Long userId = 1L;
        Long startLocationId = 1L;
        Long endLocationId = 2L;

        CreateMissionRequestDto requestDto = new CreateMissionRequestDto(userId, startLocationId, endLocationId);

        given(missionService.createMission(any(CreateMissionServiceRequestDto.class)))
                .willReturn(CreateMissionResponseDto.builder().missionId(1L).build());

        // when then
        mockMvc.perform(
                post("/api/missions")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON)
        )
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.missionId").value(1L));
    }

    @DisplayName("userId가 null이면 400 응답을 반환한다.")
    @Test
    void createMissionWithNullUserId() throws Exception {

        // given
        CreateMissionRequestDto requestDto = new CreateMissionRequestDto(null, 1L, 2L);

        // when then
        mockMvc.perform(
                post("/api/missions")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON)
        )
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 입력값입니다."));
    }

    @DisplayName("startLocationId가 null이면 400 응답을 반환한다.")
    @Test
    void createMissionWithNullStartLocationId() throws Exception {

        // given
        CreateMissionRequestDto requestDto = new CreateMissionRequestDto(1L, null, 2L);

        // when then
        mockMvc.perform(
                post("/api/missions")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON)
        )
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 입력값입니다."));
    }

    @DisplayName("endLocationId가 null이면 400 응답을 반환한다.")
    @Test
    void createMissionWithNullEndLocationId() throws Exception {

        // given
        CreateMissionRequestDto requestDto = new CreateMissionRequestDto(1L, 1L, null);

        // when then
        mockMvc.perform(
                post("/api/missions")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON)
        )
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("잘못된 입력값입니다."));
    }

    @DisplayName("존재하지 않는 userId로 요청하면 404 응답을 반환한다.")
    @Test
    void createMissionWithNotFoundUser() throws Exception {

        // given
        CreateMissionRequestDto requestDto = new CreateMissionRequestDto(999L, 1L, 2L);

        given(missionService.createMission(any(CreateMissionServiceRequestDto.class)))
                .willThrow(new BusinessException(UserErrorCode.USER_NOT_FOUND_EXCEPTION));

        // when then
        mockMvc.perform(
                post("/api/missions")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON)
        )
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("해당 사용자를 조회할 수 없습니다."));
    }

    @DisplayName("존재하지 않는 startLocationId로 요청하면 404 응답을 반환한다.")
    @Test
    void createMissionWithNotFoundStartLocation() throws Exception {

        // given
        CreateMissionRequestDto requestDto = new CreateMissionRequestDto(1L, 999L, 2L);

        given(missionService.createMission(any(CreateMissionServiceRequestDto.class)))
                .willThrow(new BusinessException(LocationErrorCode.LOCATION_NOT_FOUND_EXCEPTION));

        // when then
        mockMvc.perform(
                post("/api/missions")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON)
        )
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("해당 위치를 조회할 수 없습니다."));
    }

    @DisplayName("존재하지 않는 endLocationId로 요청하면 404 응답을 반환한다.")
    @Test
    void createMissionWithNotFoundEndLocation() throws Exception {

        // given
        CreateMissionRequestDto requestDto = new CreateMissionRequestDto(1L, 1L, 999L);

        given(missionService.createMission(any(CreateMissionServiceRequestDto.class)))
                .willThrow(new BusinessException(LocationErrorCode.LOCATION_NOT_FOUND_EXCEPTION));

        // when then
        mockMvc.perform(
                post("/api/missions")
                        .content(objectMapper.writeValueAsString(requestDto))
                        .contentType(MediaType.APPLICATION_JSON)
        )
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("해당 위치를 조회할 수 없습니다."));
    }

}