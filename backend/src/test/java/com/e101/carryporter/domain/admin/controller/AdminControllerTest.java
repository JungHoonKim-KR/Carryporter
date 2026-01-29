package com.e101.carryporter.domain.admin.controller;

import com.e101.carryporter.domain.admin.controller.dto.request.DispatchRequestDto;
import com.e101.carryporter.domain.admin.controller.dto.request.UnlockRobotRequestDto;
import com.e101.carryporter.support.WebMvcTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AdminControllerTest extends WebMvcTestSupport {

    @Test
    @DisplayName("로봇 잠금 해제 API 호출 시 204 No Content를 반환한다")
    void unlockRobot() throws Exception {
        // given
        Long missionId = 1L;
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(1L);

        willDoNothing()
                .given(robotService)
                .unlockByAdmin(anyLong(), anyLong());

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/unlock", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/unlock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("로봇 잠금 API 호출 시 204 No Content를 반환한다")
    void lockRobot() throws Exception {
        // given
        Long missionId = 1L;
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(1L);

        willDoNothing()
                .given(robotService)
                .lockByAdmin(anyLong(), anyLong());

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/lock", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/lock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("로봇 잠금 해제 API 호출 시 robotId가 null이면 400 Bad Request를 반환한다")
    void unlockRobot_WithNullRobotId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(null);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/unlock", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/unlock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 잠금 해제 API 호출 시 robotId가 음수이면 400 Bad Request를 반환한다")
    void unlockRobot_WithNegativeRobotId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(-1L);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/unlock", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/unlock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 잠금 API 호출 시 robotId가 null이면 400 Bad Request를 반환한다")
    void lockRobot_WithNullRobotId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(null);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/lock", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/lock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 잠금 API 호출 시 robotId가 음수이면 400 Bad Request를 반환한다")
    void lockRobot_WithNegativeRobotId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(-1L);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/lock", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/lock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 이동 API 호출 시 204 No Content를 반환한다")
    void dispatch() throws Exception {
        // given
        Long missionId = 1L;
        DispatchRequestDto requestDto = createMoveRequestDto(1L, 1L);

        willDoNothing()
                .given(robotService)
                .move(any());

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/dispatch", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/dispatch");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("로봇 이동 API 호출 시 robotId가 null이면 400 Bad Request를 반환한다")
    void move_WithNullRobotId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        DispatchRequestDto requestDto = createMoveRequestDto(null, 1L);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/dispatch", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/dispatch");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 이동 API 호출 시 callLocationId가 null이면 400 Bad Request를 반환한다")
    void move_WithNullCallLocationId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        DispatchRequestDto requestDto = createMoveRequestDto(1L, null);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/dispatch", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/dispatch");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 이동 API 호출 시 robotId가 음수이면 400 Bad Request를 반환한다")
    void move_WithNegativeRobotId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        DispatchRequestDto requestDto = createMoveRequestDto(-1L, 1L);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/dispatch", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/dispatch");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 이동 API 호출 시 callLocationId가 음수이면 400 Bad Request를 반환한다")
    void move_WithNegativeCallLocationId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        DispatchRequestDto requestDto = createMoveRequestDto(1L, -1L);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/dispatch", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/dispatch");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    private UnlockRobotRequestDto createUnlockRobotRequestDto(Long robotId) {
        return new UnlockRobotRequestDto(robotId);
    }

    private DispatchRequestDto createMoveRequestDto(Long robotId, Long callLocationId) {
        return new DispatchRequestDto(robotId, callLocationId);
    }
}
