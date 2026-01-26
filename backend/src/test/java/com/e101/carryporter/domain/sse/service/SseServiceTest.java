package com.e101.carryporter.domain.sse.service;

import com.e101.carryporter.domain.sse.dto.SseEventName;
import com.e101.carryporter.domain.sse.repository.SseEmitterRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) // Mockito 사용
class SseServiceTest {

    @Mock
    SseEmitterRepository repository; // 가짜 저장소

    @InjectMocks
    SseService sseService; // 테스트할 대상 (가짜 저장소 주입됨)

    @Test
    @DisplayName("구독: 일반 유저는 saveUser()가 호출되어야 한다")
    void subscribeUser() {
        // given
        String userId = "user1";
        String role = "ROLE_USER";

        // when
        sseService.subscribe(userId, role);

        // then
        // verify: repository.saveUser 메서드가 실행되었는지 감시
        verify(repository).saveUser(eq(userId), any(SseEmitter.class));
    }

    @Test
    @DisplayName("구독: 관리자는 saveAdmin()이 호출되어야 한다")
    void subscribeAdmin() {
        // given
        String adminId = "admin1";
        String role = "ROLE_ADMIN";

        // when
        sseService.subscribe(adminId, role);

        // then
        // verify: repository.saveAdmin 메서드가 실행되었는지 감시
        verify(repository).saveAdmin(eq(adminId), any(SseEmitter.class));
    }

    @Test
    @DisplayName("관리자 전체 알림 시 findAllAdmins()를 호출하는가")
    void broadcastToAdmins() {
        // when
        sseService.broadcastToAdmins(SseEventName.CONNECT, "data");
        // then
        verify(repository).findAllAdmins();
    }
}