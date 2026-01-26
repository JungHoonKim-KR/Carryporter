package com.e101.carryporter.domain.sse.repository;

import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class SseEmitterRepository {

    // 동시성 문제를 방지하기 위해 ConcurrentHashMap 사용

    // 1. 일반 사용자용 저장소 (Key: userId)
    private final Map<String, SseEmitter> userEmitters = new ConcurrentHashMap<>();

    // 2. 관리자용 저장소 (Key: adminId)
    // 관리자는 '관제' 목적이므로 전체 브로드캐스트가 자주 일어납니다.
    private final Map<String, SseEmitter> adminEmitters = new ConcurrentHashMap<>();

    /* --- 사용자(User) 관련 메서드 --- */
    public void saveUser(String userId, SseEmitter emitter) {
        userEmitters.put(userId, emitter);
    }

    public void deleteUser(String userId) {
        userEmitters.remove(userId);
    }

    public SseEmitter findUser(String userId) {
        return userEmitters.get(userId);
    }

    /* --- 관리자(Admin) 관련 메서드 --- */
    public void saveAdmin(String adminId, SseEmitter emitter) {
        adminEmitters.put(adminId, emitter);
    }

    public void deleteAdmin(String adminId) {
        adminEmitters.remove(adminId);
    }

    // 모든 관리자에게 알림을 보낼 때 사용
    public Map<String, SseEmitter> findAllAdmins() {
        return adminEmitters;
    }
}