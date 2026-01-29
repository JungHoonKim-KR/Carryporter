package com.e101.carryporter.domain.admin.controller;

import com.e101.carryporter.domain.admin.controller.dto.request.UnlockRobotRequestDto;
import com.e101.carryporter.support.WebMvcTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;

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
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(1L, 1L);

        willDoNothing()
                .given(robotService)
                .unlockByAdmin(anyLong(), anyLong());

        // when & then
        mockMvc.perform(post("/admin/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/unlock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("로봇 잠금 API 호출 시 204 No Content를 반환한다")
    void lockRobot() throws Exception {
        // given
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(1L, 1L);

        willDoNothing()
                .given(robotService)
                .lockByAdmin(anyLong(), anyLong());

        // when & then
        mockMvc.perform(post("/admin/lock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/lock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("로봇 잠금 해제 API 호출 시 robotId가 null이면 400 Bad Request를 반환한다")
    void unlockRobot_WithNullRobotId_ReturnsBadRequest() throws Exception {
        // given
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(null, 1L);

        // when & then
        mockMvc.perform(post("/admin/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/unlock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 잠금 해제 API 호출 시 missionId가 null이면 400 Bad Request를 반환한다")
    void unlockRobot_WithNullMissionId_ReturnsBadRequest() throws Exception {
        // given
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(1L, null);

        // when & then
        mockMvc.perform(post("/admin/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/unlock");
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
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(-1L, 1L);

        // when & then
        mockMvc.perform(post("/admin/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/unlock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 잠금 해제 API 호출 시 missionId가 음수이면 400 Bad Request를 반환한다")
    void unlockRobot_WithNegativeMissionId_ReturnsBadRequest() throws Exception {
        // given
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(1L, -1L);

        // when & then
        mockMvc.perform(post("/admin/unlock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/unlock");
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
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(null, 1L);

        // when & then
        mockMvc.perform(post("/admin/lock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/lock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 잠금 API 호출 시 missionId가 null이면 400 Bad Request를 반환한다")
    void lockRobot_WithNullMissionId_ReturnsBadRequest() throws Exception {
        // given
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(1L, null);

        // when & then
        mockMvc.perform(post("/admin/lock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/lock");
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
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(-1L, 1L);

        // when & then
        mockMvc.perform(post("/admin/lock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/lock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("로봇 잠금 API 호출 시 missionId가 음수이면 400 Bad Request를 반환한다")
    void lockRobot_WithNegativeMissionId_ReturnsBadRequest() throws Exception {
        // given
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(1L, -1L);

        // when & then
        mockMvc.perform(post("/admin/lock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/lock");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    private UnlockRobotRequestDto createUnlockRobotRequestDto(Long robotId, Long missionId) {
        UnlockRobotRequestDto dto = new UnlockRobotRequestDto();
        ReflectionTestUtils.setField(dto, "robotId", robotId);
        ReflectionTestUtils.setField(dto, "missionId", missionId);
        return dto;
    }
}