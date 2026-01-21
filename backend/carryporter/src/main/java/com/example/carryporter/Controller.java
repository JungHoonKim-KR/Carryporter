package com.example.carryporter;

import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
public class Controller {

    // 연결된 클라이언트 리스트 (thread-safe)
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    // 1. 클라이언트가 연결을 맺는 엔드포인트
    @GetMapping(value = "/sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // 만료시간 길게 설정
        this.emitters.add(emitter);

        // 종료/타임아웃 시 리스트에서 제거
        emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event().name("connect").data("연결 성공!"));
        } catch (IOException e) {
            this.emitters.remove(emitter);
        }

        return emitter;
    }

    // 2. 5초마다 모든 클라이언트에게 메시지 전송
    @Scheduled(fixedRate = 5000)
    public void sendEvents() {
        System.out.println("Sending events to " + emitters.size() + " clients");
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("server-time") // 이벤트 이름
                        .data("테스트 메시지 " + LocalTime.now())); // 데이터
            } catch (IOException e) {
                this.emitters.remove(emitter);
            }
        }
    }
}