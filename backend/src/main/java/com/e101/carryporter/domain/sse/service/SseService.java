package com.e101.carryporter.domain.sse.service;

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
     * [USER] 특정 사용자에게 알림 전송
     * @param eventName MissionStatus.name() 값이 들어오게 됩니다.
     */
    public void sendToUser(Long userId, String eventName, Object data) {
        SseEmitter emitter = emitterRepository.findUser(userId);
        if (emitter != null) {
            sendToClient(emitter, userId, eventName, data);
        }
    }

    /**
     * [ADMIN] 모든 관리자에게 알림 전송
     */
    public void broadcastToAdmins(String eventName, Object data) {
        Map<Long, SseEmitter> admins = emitterRepository.findAllAdmins();
        admins.forEach((id, emitter) -> {
            sendToClient(emitter, id, eventName, data);
        });
    }

    private void sendToClient(SseEmitter emitter, Long id, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(String.valueOf(id))
                    .name(eventName) // "MATCHING", "IN_PROGRESS" 등의 문자열이 그대로 들어감
                    .data(data));
        } catch (IOException e) {
            emitterRepository.deleteUser(id);
            emitterRepository.deleteAdmin(id);
            emitter.completeWithError(e);
        }
    }
}