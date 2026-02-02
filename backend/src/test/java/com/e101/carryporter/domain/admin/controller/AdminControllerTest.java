package com.e101.carryporter.domain.admin.controller;

import com.e101.carryporter.domain.admin.controller.dto.request.DispatchRequestDto;
import com.e101.carryporter.domain.admin.controller.dto.request.FinalizeRequestDto;
import com.e101.carryporter.domain.admin.controller.dto.request.JoinRequestDto;
import com.e101.carryporter.domain.admin.controller.dto.request.LoginRequestDto;
import com.e101.carryporter.domain.admin.controller.dto.request.UnlockRobotRequestDto;
import com.e101.carryporter.domain.auth.controller.dto.response.TokenResponseDto;
import com.e101.carryporter.domain.user.exception.UserErrorCode;
import com.e101.carryporter.global.exception.BusinessException;
import com.e101.carryporter.support.WebMvcTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.startsWith;

class AdminControllerTest extends WebMvcTestSupport {

    @Test
    @DisplayName("관리자 계정 생성 요청 시 정상적으로 처리되고 204를 반환한다")
    void join() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                "admin@mattermost.com",
                "관리자",
                "password123!"
        );

        given(adminService.join(anyString(), anyString(), anyString()))
                .willReturn(1L);

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(adminService, times(1)).join(
                requestDto.getMmEmail(),
                requestDto.getName(),
                requestDto.getPassword()
        );
    }

    @Test
    @DisplayName("관리자 계정 생성 시 mmEmail이 null이면 400 Bad Request를 반환한다")
    void joinWithNullMmEmail() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                null,
                "관리자",
                "password123!"
        );

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).join(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 계정 생성 시 mmEmail이 빈 문자열이면 400 Bad Request를 반환한다")
    void joinWithBlankMmEmail() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                "   ",
                "관리자",
                "password123!"
        );

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).join(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 계정 생성 시 name이 null이면 400 Bad Request를 반환한다")
    void joinWithNullName() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                "admin@mattermost.com",
                null,
                "password123!"
        );

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).join(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 계정 생성 시 name이 빈 문자열이면 400 Bad Request를 반환한다")
    void joinWithBlankName() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                "admin@mattermost.com",
                "   ",
                "password123!"
        );

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).join(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 계정 생성 시 password가 null이면 400 Bad Request를 반환한다")
    void joinWithNullPassword() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                "admin@mattermost.com",
                "관리자",
                null
        );

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).join(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 계정 생성 시 password가 빈 문자열이면 400 Bad Request를 반환한다")
    void joinWithBlankPassword() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                "admin@mattermost.com",
                "관리자",
                "   "
        );

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).join(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 계정 생성 시 모든 필드가 null이면 400 Bad Request를 반환한다")
    void joinWithAllNullFields() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                null,
                null,
                null
        );

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).join(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("중복된 이메일로 관리자 계정 생성 시 409 Conflict를 반환한다")
    void joinWithDuplicatedEmail() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                "admin@mattermost.com",
                "관리자",
                "password123!"
        );

        given(adminService.join(anyString(), anyString(), anyString()))
                .willThrow(new BusinessException(UserErrorCode.DUPLICATED_USER_EMAIL));

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(UserErrorCode.DUPLICATED_USER_EMAIL.getMessage()))
                .andExpect(jsonPath("$.status").value("CONFLICT"))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(adminService, times(1)).join(
                requestDto.getMmEmail(),
                requestDto.getName(),
                requestDto.getPassword()
        );
    }

    @Test
    @DisplayName("중복된 이름으로 관리자 계정 생성 시 409 Conflict를 반환한다")
    void joinWithDuplicatedName() throws Exception {
        // given
        JoinRequestDto requestDto = new JoinRequestDto(
                "admin@mattermost.com",
                "관리자",
                "password123!"
        );

        given(adminService.join(anyString(), anyString(), anyString()))
                .willThrow(new BusinessException(UserErrorCode.DUPLICATED_ADMIN_NAME));

        // when & then
        mockMvc.perform(post("/admin/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(UserErrorCode.DUPLICATED_ADMIN_NAME.getMessage()))
                .andExpect(jsonPath("$.status").value("CONFLICT"))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(adminService, times(1)).join(
                requestDto.getMmEmail(),
                requestDto.getName(),
                requestDto.getPassword()
        );
    }

    @Test
    @DisplayName("관리자 로그인 시 정상적으로 처리되고 토큰과 쿠키를 반환한다")
    void login() throws Exception {
        // given
        LoginRequestDto requestDto = new LoginRequestDto(
                "admin@mattermost.com",
                "password123!"
        );

        TokenResponseDto tokenResponse = TokenResponseDto.builder()
                .accessToken("access-token-value")
                .refreshToken("refresh-token-value")
                .grantType("Bearer")
                .expiresIn(3600L)
                .build();

        given(adminService.login(anyString(), anyString()))
                .willReturn(tokenResponse);

        // when & then
        mockMvc.perform(post("/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token-value"))
                .andExpect(jsonPath("$.refreshToken").doesNotExist()) // 보안상 body에는 없어야 함
                .andExpect(jsonPath("$.grantType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(3600))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, startsWith("refreshToken=")));

        verify(adminService, times(1)).login(
                requestDto.getMmEmail(),
                requestDto.getPassword()
        );
    }

    @Test
    @DisplayName("관리자 로그인 시 mmEmail이 null이면 400 Bad Request를 반환한다")
    void loginWithNullMmEmail() throws Exception {
        // given
        LoginRequestDto requestDto = new LoginRequestDto(
                null,
                "password123!"
        );

        // when & then
        mockMvc.perform(post("/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).login(anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 로그인 시 mmEmail이 빈 문자열이면 400 Bad Request를 반환한다")
    void loginWithBlankMmEmail() throws Exception {
        // given
        LoginRequestDto requestDto = new LoginRequestDto(
                "   ",
                "password123!"
        );

        // when & then
        mockMvc.perform(post("/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).login(anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 로그인 시 password가 null이면 400 Bad Request를 반환한다")
    void loginWithNullPassword() throws Exception {
        // given
        LoginRequestDto requestDto = new LoginRequestDto(
                "admin@mattermost.com",
                null
        );

        // when & then
        mockMvc.perform(post("/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).login(anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 로그인 시 password가 빈 문자열이면 400 Bad Request를 반환한다")
    void loginWithBlankPassword() throws Exception {
        // given
        LoginRequestDto requestDto = new LoginRequestDto(
                "admin@mattermost.com",
                "   "
        );

        // when & then
        mockMvc.perform(post("/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).login(anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 로그인 시 모든 필드가 null이면 400 Bad Request를 반환한다")
    void loginWithAllNullFields() throws Exception {
        // given
        LoginRequestDto requestDto = new LoginRequestDto(
                null,
                null
        );

        // when & then
        mockMvc.perform(post("/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(adminService, never()).login(anyString(), anyString());
    }

    @Test
    @DisplayName("관리자 로그인 시 잘못된 비밀번호를 입력하면 401 Unauthorized를 반환한다")
    void loginWithWrongPassword() throws Exception {
        // given
        LoginRequestDto requestDto = new LoginRequestDto(
                "admin@mattermost.com",
                "wrongpassword"
        );

        given(adminService.login(anyString(), anyString()))
                .willThrow(new BusinessException(UserErrorCode.UNAUTHORIZED));

        // when & then
        mockMvc.perform(post("/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(UserErrorCode.UNAUTHORIZED.getMessage()))
                .andExpect(jsonPath("$.status").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(adminService, times(1)).login(
                requestDto.getMmEmail(),
                requestDto.getPassword()
        );
    }

    @Test
    @DisplayName("관리자 로그인 시 존재하지 않는 이메일을 입력하면 404 Not Found를 반환한다")
    void loginWithNonExistentEmail() throws Exception {
        // given
        LoginRequestDto requestDto = new LoginRequestDto(
                "nonexistent@mattermost.com",
                "password123!"
        );

        given(adminService.login(anyString(), anyString()))
                .willThrow(new BusinessException(UserErrorCode.USER_NOT_FOUND));

        // when & then
        mockMvc.perform(post("/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(UserErrorCode.USER_NOT_FOUND.getMessage()))
                .andExpect(jsonPath("$.status").value("NOT_FOUND"))
                .andExpect(jsonPath("$.timestamp").exists());

        verify(adminService, times(1)).login(
                requestDto.getMmEmail(),
                requestDto.getPassword()
        );
    }


    @Test
    @DisplayName("로봇 잠금 해제 API 호출 시 204 No Content를 반환한다")
    void unlockRobot() throws Exception {
        // given
        Long missionId = 1L;
        UnlockRobotRequestDto requestDto = createUnlockRobotRequestDto(1L);

        willDoNothing()
                .given(robotService)
                .unlockByAdmin(anyLong());

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
                .lockByAdmin(anyLong());

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
    @DisplayName("로봇 이동 API 호출 시 204 No Content를 반환한다")
    void dispatch() throws Exception {
        // given
        Long missionId = 1L;
        // DTO 생성 로직 삭제

        willDoNothing()
                .given(robotService)
                .move(missionId); // any() 대신 명확한 인자 전달 검증

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/dispatch", missionId)
                        // Request Body가 없으므로 contentType, content 삭제
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/dispatch");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isNoContent());

        // verify: 서비스가 올바른 missionId로 호출되었는지 검증
        verify(robotService).move(missionId);
    }

    @Test
    @DisplayName("미션 최종 완료 API 호출 시 204 No Content를 반환한다")
    void finalizeMission() throws Exception {
        // given
        Long missionId = 1L;
        FinalizeRequestDto requestDto = createFinalizeRequestDto(1L);

        willDoNothing()
                .given(robotService)
                .finalizeMission(anyLong(), anyLong());

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/finalize", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/finalize");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("미션 최종 완료 API 호출 시 robotId가 null이면 400 Bad Request를 반환한다")
    void finalize_WithNullRobotId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        FinalizeRequestDto requestDto = createFinalizeRequestDto(null);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/finalize", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/finalize");
                            return request;
                        }))
                .andDo(print())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").value("BAD_REQUEST"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("미션 최종 완료 API 호출 시 robotId가 음수이면 400 Bad Request를 반환한다")
    void finalize_WithNegativeRobotId_ReturnsBadRequest() throws Exception {
        // given
        Long missionId = 1L;
        FinalizeRequestDto requestDto = createFinalizeRequestDto(-1L);

        // when & then
        mockMvc.perform(post("/admin/missions/{missionId}/finalize", missionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(request -> {
                            request.setServletPath("/admin/missions/" + missionId + "/finalize");
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

    private FinalizeRequestDto createFinalizeRequestDto(Long robotId) {
        return new FinalizeRequestDto(robotId);
    }
}
