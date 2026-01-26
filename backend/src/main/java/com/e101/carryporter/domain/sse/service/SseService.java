package com.e101.carryporter.domain.sse.service;

import com.e101.carryporter.domain.sse.dto.SseEventName;
import com.e101.carryporter.domain.sse.repository.SseEmitterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SseService {

    private final SseEmitterRepository emitterRepository;

    // 연결 유지 시간: 60분 (기본값보다 길게 설정)
    private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60;

    /**
     * 클라이언트 연결 (구독)
     * @param id   사용자 ID 또는 관리자 ID
     * @param role "ROLE_USER" or "ROLE_ADMIN"
     */
    public SseEmitter subscribe(String id, String role) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 1. 연결 종료/에러/타임아웃 시 저장소에서 제거 (Memory Leak 방지)
        if ("ROLE_ADMIN".equals(role)) {
            emitter.onCompletion(() -> emitterRepository.deleteAdmin(id));
            emitter.onTimeout(() -> emitterRepository.deleteAdmin(id));
            emitterRepository.saveAdmin(id, emitter);
        } else {
            emitter.onCompletion(() -> emitterRepository.deleteUser(id));
            emitter.onTimeout(() -> emitterRepository.deleteUser(id));
            emitterRepository.saveUser(id, emitter);
        }

        // 2. 503 Service Unavailable 방지용 더미 데이터 전송
        // 연결되자마자 아무 데이터도 안 보내면 프록시 서버에서 타임아웃 낼 수 있음
        sendToClient(emitter, id, SseEventName.CONNECT.getValue(), "Connected! [Role: " + role + "]");

        return emitter;
    }

    /**
     * [USER] 특정 사용자 1명에게 알림 전송
     */
    public void sendToUser(String userId, SseEventName eventName, Object data) {
        SseEmitter emitter = emitterRepository.findUser(userId);
        if (emitter != null) {
            sendToClient(emitter, userId, eventName.getValue(), data);
        }
    }

    /**
     * [ADMIN] 현재 접속 중인 모든 관리자에게 알림 전송 (Broadcast)
     */
    public void broadcastToAdmins(SseEventName eventName, Object data) {
        Map<String, SseEmitter> admins = emitterRepository.findAllAdmins();
        admins.forEach((id, emitter) -> {
            sendToClient(emitter, id, eventName.getValue(), data);
        });
    }

    /**
     * 실제 전송 로직 (내부 사용)
     */
    private void sendToClient(SseEmitter emitter, String id, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(id)
                    .name(eventName)
                    .data(data));
        } catch (IOException e) {
            // 전송 실패 시 연결이 끊긴 것으로 간주하고 정리
            emitterRepository.deleteUser(id);     // User 삭제 시도
            emitterRepository.deleteAdmin(id);    // Admin 삭제 시도 (어차피 없으면 무시됨)
            emitter.completeWithError(e);
        }
    }
}