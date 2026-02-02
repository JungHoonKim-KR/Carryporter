package com.e101.carryporter.domain.sse.service;

import com.e101.carryporter.domain.sse.repository.SseEmitterRepository;
import com.e101.carryporter.domain.user.entity.Role; // Role Enum 추가
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class SseService {

    private final SseEmitterRepository emitterRepository;

    // 연결 유지 시간: 60분
    private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60;

    // 하트비트 간격: 45초 (Nginx 기본 타임아웃 60초보다 짧아야 함)
    private static final Long HEARTBEAT_INTERVAL = 45L;

    public SseEmitter subscribe(Long id, String role) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 1. 하트비트 스케줄러 설정
        // 각 연결마다 독립적인 하트비트를 보내기 위해 스케줄러를 생성합니다.
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

        // 45초마다 빈 이벤트를 전송하여 연결 유지
        scheduler.scheduleAtFixedRate(() -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("heartbeat")
                        .data("keep-alive"));
            } catch (IOException e) {
                log.debug("[SSE-HEARTBEAT] 연결 종료로 인한 하트비트 중단 | ID: {}", id);
                scheduler.shutdown();
            }
        }, HEARTBEAT_INTERVAL, HEARTBEAT_INTERVAL, TimeUnit.SECONDS);

        // 2. 콜백 설정 (연결 종료/타임아웃 시 스케줄러도 함께 종료)
        if (Role.ADMIN.name().equals(role)) {
            emitter.onCompletion(() -> {
                emitterRepository.deleteAdmin(id);
                scheduler.shutdown();
            });
            emitter.onTimeout(() -> {
                emitterRepository.deleteAdmin(id);
                scheduler.shutdown();
            });
            emitterRepository.saveAdmin(id, emitter);
        } else {
            emitter.onCompletion(() -> {
                emitterRepository.deleteUser(id);
                scheduler.shutdown();
            });
            emitter.onTimeout(() -> {
                emitterRepository.deleteUser(id);
                scheduler.shutdown();
            });
            emitterRepository.saveUser(id, emitter);
        }

        // 3. 최초 연결 더미 데이터 전송
        sendToClient(emitter, id, "CONNECT", "Connected! [Role: " + role + "]");

        return emitter;
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
     * [USER] 특정 사용자에게 알림 전송
     */
    public void sendToUser(Long userId, String eventName, Object data) {
        SseEmitter emitter = emitterRepository.findUser(userId);
        if (emitter != null) {
            log.debug("[SSE-SERVICE] 사용자 전송 시도 | ID: {} | Event: {}", userId, eventName);
            sendToClient(emitter, userId, eventName, data);
        } else {
            log.warn("[SSE-SERVICE] 전송 실패 (구독 중인 유저 없음) | ID: {}", userId);
        }
    }

    /**
     * 실제 전송 로직
     */
    private void sendToClient(SseEmitter emitter, Long id, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(String.valueOf(id))
                    .name(eventName)
                    .data(data)); // ✨ 여기서 Object(Map 등)가 JSON 문자열로 자동 변환됨

        } catch (IOException e) {
            log.error("[SSE-SERVICE] 전송 중 입출력 에러 발생 | ID: {} | Error: {}", id, e.getMessage());
            // 연결이 유효하지 않으므로 삭제
            emitterRepository.deleteUser(id);
            emitterRepository.deleteAdmin(id);
            emitter.completeWithError(e);
        } catch (Exception e) {
            log.error("[SSE-SERVICE] 알 수 없는 전송 에러 | ID: {}", id, e);
        }
    }


}