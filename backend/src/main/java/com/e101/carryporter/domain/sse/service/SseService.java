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

    // 연결 유지 시간: 60분
    private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60;

    /**
     * 클라이언트 연결 (구독)
     * @param id   사용자 ID (PK: Long)
     * @param role "ROLE_USER" or "ROLE_ADMIN"
     */
    // ✅ 변경: id 타입을 String -> Long으로 변경
    public SseEmitter subscribe(Long id, String role) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 1. 저장소 저장 및 콜백 설정
        if ("ROLE_ADMIN".equals(role)) {
            // ✅ Repository 메서드들도 Long을 받도록 수정되었다고 가정
            emitter.onCompletion(() -> emitterRepository.deleteAdmin(id));
            emitter.onTimeout(() -> emitterRepository.deleteAdmin(id));
            emitterRepository.saveAdmin(id, emitter);
        } else {
            emitter.onCompletion(() -> emitterRepository.deleteUser(id));
            emitter.onTimeout(() -> emitterRepository.deleteUser(id));
            emitterRepository.saveUser(id, emitter);
        }

        // 2. 더미 데이터 전송 (503 방지)
        sendToClient(emitter, id, SseEventName.CONNECT.getValue(), "Connected! [Role: " + role + "]");

        return emitter;
    }

    /**
     * [USER] 특정 사용자 1명에게 알림 전송
     */
    public void sendToUser(Long userId, SseEventName eventName, Object data) {
        SseEmitter emitter = emitterRepository.findUser(userId);
        if (emitter != null) {
            sendToClient(emitter, userId, eventName.getValue(), data);
        }
    }

    /**
     * [ADMIN] 현재 접속 중인 모든 관리자에게 알림 전송 (Broadcast)
     */
    public void broadcastToAdmins(SseEventName eventName, Object data) {
        Map<Long, SseEmitter> admins = emitterRepository.findAllAdmins();

        admins.forEach((id, emitter) -> {
            sendToClient(emitter, id, eventName.getValue(), data);
        });
    }

    /**
     * 실제 전송 로직 (내부 사용)
     */
    private void sendToClient(SseEmitter emitter, Long id, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(String.valueOf(id)) // ★ 주의: SSE 프로토콜의 ID는 String이어야 하므로 여기서만 변환
                    .name(eventName)
                    .data(data));
        } catch (IOException e) {
            // 전송 실패 시 정리
            emitterRepository.deleteUser(id);
            emitterRepository.deleteAdmin(id);
            emitter.completeWithError(e);
        }
    }
}