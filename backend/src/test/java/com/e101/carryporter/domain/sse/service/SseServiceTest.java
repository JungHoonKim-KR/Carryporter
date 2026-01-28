package com.e101.carryporter.domain.sse.service;

import com.e101.carryporter.domain.sse.repository.SseEmitterRepository;
import com.e101.carryporter.support.IntegrationTestSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.assertj.core.api.Assertions.assertThat;

class SseServiceTest extends IntegrationTestSupport {

    @Autowired
    private SseService sseService;

    @Autowired
    private SseEmitterRepository repository;

    @Test
    @DisplayName("구독: 일반 유저 구독 시 실제 Repository에 저장되어야 한다")
    void subscribeUser() {
        // given
        Long userId = 1L;
        String role = "ROLE_USER";

        // when
        SseEmitter emitter = sseService.subscribe(userId, role);

        // then
        SseEmitter savedEmitter = repository.findUser(userId);
        assertThat(savedEmitter).isNotNull();
        assertThat(savedEmitter).isEqualTo(emitter);
    }

    @Test
    @DisplayName("구독: 관리자 구독 시 실제 Repository의 Admin 맵에 저장되어야 한다")
    void subscribeAdmin() {
        // given
        Long adminId = 99L;
        String role = "ROLE_ADMIN";

        // when
        sseService.subscribe(adminId, role);

        // then
        SseEmitter savedEmitter = repository.findAllAdmins().get(adminId);
        assertThat(savedEmitter).isNotNull();
    }

    @Test
    @DisplayName("알림 전송: 전송 로직 호출 시 예외가 발생하지 않아야 한다")
    void sendNotification() {
        // given
        Long userId = 1L;
        sseService.subscribe(userId, "ROLE_USER");

        // MissionStatus.name()을 모사한 String 값 사용
        String eventName = "MATCHING";
        String data = "미션 매칭 알림 테스트";

        // when & then
        // 실제 인프라(컨테이너)가 떠 있는 상태에서 서비스 로직이 끝까지 도는지 확인
        sseService.sendToUser(userId, eventName, data);
    }

    @Test
    @DisplayName("관리자 전체 알림: 다수의 관리자에게 브로드캐스트 전송 확인")
    void broadcastToAdmins() {
        // given
        sseService.subscribe(101L, "ROLE_ADMIN");
        sseService.subscribe(102L, "ROLE_ADMIN");

        // when
        sseService.broadcastToAdmins("NEW_MISSION", "새로운 미션 등록");

        // then
        assertThat(repository.findAllAdmins()).hasSize(2);
    }
}