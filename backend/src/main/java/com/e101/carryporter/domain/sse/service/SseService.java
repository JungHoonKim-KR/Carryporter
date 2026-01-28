package com.e101.carryporter.domain.sse.service;

import com.e101.carryporter.domain.sse.repository.SseEmitterRepository;
import com.e101.carryporter.domain.user.entity.Role; // Role Enum 추가
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
     * @param role 사용자의 역할 (Role Enum의 name() 값 전달 권장)
     */
    public SseEmitter subscribe(Long id, String role) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 1. 저장소 저장 및 콜백 설정
        // ✅ 하드코딩된 "ROLE_ADMIN" 대신 Enum의 name()과 비교 (혹은 equalsIgnoreCase)
        if (Role.ADMIN.name().equals(role)) {
            emitter.onCompletion(() -> emitterRepository.deleteAdmin(id));
            emitter.onTimeout(() -> emitterRepository.deleteAdmin(id));
            emitterRepository.saveAdmin(id, emitter);
        } else {
            // "BASIC"이거나 그 외의 경우
            emitter.onCompletion(() -> emitterRepository.deleteUser(id));
            emitter.onTimeout(() -> emitterRepository.deleteUser(id));
            emitterRepository.saveUser(id, emitter);
        }

        // 2. 더미 데이터 전송 (503 Service Unavailable 방지)
        // ✅ SseEventName.CONNECT.getValue() 대신 직관적으로 "CONNECT" 문자열 사용
        sendToClient(emitter, id, "CONNECT", "Connected! [Role: " + role + "]");

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
     * @param eventName MissionStatus.name() 혹은 커스텀 이벤트 이름
     */
    public void broadcastToAdmins(String eventName, Object data) {
        Map<Long, SseEmitter> admins = emitterRepository.findAllAdmins();
        admins.forEach((id, emitter) -> {
            sendToClient(emitter, id, eventName, data);
        });
    }

    /**
     * 실제 전송 로직
     */
    private void sendToClient(SseEmitter emitter, Long id, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(String.valueOf(id))
                    .name(eventName)
                    .data(data));
        } catch (IOException e) {
            // 전송 실패 시 정리 (User/Admin 둘 다 시도하여 존재하는 쪽 삭제)
            emitterRepository.deleteUser(id);
            emitterRepository.deleteAdmin(id);
            emitter.completeWithError(e);
        }
    }
}