package com.e101.carryporter.global.service.mqtt;

import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.entity.MissionStatus;
import com.e101.carryporter.domain.mission.event.MissionLockedEvent;
import com.e101.carryporter.domain.mission.event.MissionUnlockedEvent;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.event.RobotArrivalEvent;
import com.e101.carryporter.domain.robot.event.RobotReturnedEvent;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.e101.carryporter.domain.robot.service.RobotService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class MqttSubscriberService {

    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final RobotRepository robotRepository;
    private final MissionRepository missionRepository;
    private final RobotService robotService;
    private final TransactionTemplate transactionTemplate;

    /**
     * MQTT 메시지 수신 처리 (Paho 콜백에서 직접 호출)
     * Paho 스레드는 Spring 관리 스레드가 아니므로 TransactionTemplate 사용
     */
    public void handleMqttMessage(String topic, String payload) {
        log.info("MQTT 메시지 수신 - topic: {}, payload: {}", topic, payload);

        try {
            String[] topicParts = topic.split("/");
            if (topicParts.length < 3) {
                log.warn("잘못된 토픽 형식: {}", topic);
                return;
            }

            String mac = topicParts[1];
            String action = topicParts[2];

            switch (action) {
                case "register":
                    handleRegister(mac, payload);
                    break;
                case "arrived":
                    handleArrived(mac, payload);
                    break;
                case "error":
                    handleError(mac, payload);
                    break;
                case "IDLE":
                    handleIDLE(mac, payload);
                    break;
                case "locked":
                    handleLocked(mac, payload);
                    break;
                case "unlocked":
                    handleUnlocked(mac, payload);
                    break;
                default:
                    log.warn("알 수 없는 액션: {}", action);
            }
        } catch (Exception e) {
            log.error("MQTT 메시지 처리 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 기기 등록 처리
     * Topic: robot/{MAC}/register
     * Payload: {"mac": "..."}
     */
    private void handleRegister(String mac, String payload) {
        log.info("로봇 등록 요청 - MAC: {}", mac);
        try {
            Robot robot = robotService.registerRobot(mac);
        } catch (Exception e) {
            log.error("로봇 등록 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
        }
    }

    /**
     * 상태 보고 처리 (Heartbeat)
     * Topic: robot/{MAC}/status
     * Payload: {"bat": 80, "x": 10, "y": 20}
     */


    /**
     * 도착 알림 처리
     * Topic: robot/{MAC}/arrived
     * Payload: {} (빈 페이로드 - 로봇은 missionId를 모름)
     */
    private void handleArrived(String mac, String payload) {
        log.info("로봇 도착 알림 - MAC: {}", mac);
        try {
            transactionTemplate.executeWithoutResult(status -> {
                // 1. mac으로 로봇 조회
                Robot robot = robotRepository.findByMacAddress(mac)
                        .orElseThrow(() -> new RuntimeException("로봇을 찾을 수 없습니다: " + mac));

                // 2. 해당 로봇의 MOVING 상태 미션 조회 (이동 중이던 미션)
                Mission mission = missionRepository.findByRobotAndStatus(robot, MissionStatus.MOVING)
                        .orElseThrow(() -> new RuntimeException("진행 중인 미션을 찾을 수 없습니다. MAC: " + mac));

                log.info("로봇 도착 이벤트 발행 - missionId: {}, userId: {}", mission.getId(), mission.getUser().getId());

                eventPublisher.publishEvent(new RobotArrivalEvent(
                        mission.getId(),
                        mission.getUser().getId(),
                        robot.getRobotCode()
                ));
            });
        } catch (Exception e) {
            log.error("도착 알림 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
        }
    }

    /**
     * 배송 완료 처리
     * Topic: robot/{MAC}/delivered
     * Payload: {"missionId": 101}
     */
//    private void handleDelivered(String mac, String payload) {
//        log.info("배송 완료 알림 - MAC: {}", mac);
//        try {
//            JsonNode node = objectMapper.readTree(payload);
//            long missionId = node.has("missionId") ? node.get("missionId").asLong() : -1;
//
//            log.info("배송 완료 - MAC: {}, missionId: {}", mac, missionId);
//            // TODO: 배송 완료 비즈니스 로직 구현
//            // missionService.handleDelivered(missionId);
//        } catch (Exception e) {
//            log.error("배송 완료 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
//        }
//    }

    /**
     * 에러 발생 처리
     * Topic: robot/{MAC}/error
     * Payload: {"code": "ERR_01", "msg": "..."}
     */
    private void handleError(String mac, String payload) {
        log.warn("로봇 에러 발생 - MAC: {}", mac);
        try {
            JsonNode node = objectMapper.readTree(payload);
            String errorCode = node.has("code") ? node.get("code").asText() : "UNKNOWN";
            String errorMsg = node.has("msg") ? node.get("msg").asText() : "";

            log.error("로봇 에러 - MAC: {}, code: {}, msg: {}", mac, errorCode, errorMsg);
            // TODO: 에러 처리 비즈니스 로직 구현
            // robotService.handleError(mac, errorCode, errorMsg);
        } catch (Exception e) {
            log.error("에러 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
        }
    }

    /**
     * 관리소 복귀 완료 처리
     * Topic: robot/{MAC}/IDLE
     * Payload: {} (빈 페이로드 - 로봇은 missionId를 모름)
     */
    private void handleIDLE(String mac, String payload) {
        log.info("로봇 관리소 복귀 알림 - MAC: {}", mac);
        try {
            transactionTemplate.executeWithoutResult(status -> {
                // 1. mac으로 로봇 조회
                Robot robot = robotRepository.findByMacAddress(mac)
                        .orElseThrow(() -> new RuntimeException("로봇을 찾을 수 없습니다: " + mac));

                // 2. 해당 로봇의 RETURNING 상태 미션 조회 (복귀 중이던 미션)
                Mission mission = missionRepository.findByRobotAndStatus(robot, MissionStatus.RETURNING)
                        .orElseThrow(() -> new RuntimeException("복귀 중인 미션을 찾을 수 없습니다. MAC: " + mac));

                log.info("로봇 관리소 복귀 - MAC: {}, missionId: {}, robotId: {}", mac, mission.getId(), robot.getId());

                eventPublisher.publishEvent(new RobotReturnedEvent(mission.getId(), robot.getId(), mac));
            });
        } catch (Exception e) {
            log.error("관리소 복귀 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
        }
    }

    /**
     * 로봇 잠금 완료 처리
     * Topic: robot/{MAC}/locked
     * Payload: {} (빈 페이로드 - 로봇은 missionId를 모름)
     */
    public void handleLocked(String mac, String payload) {
        log.info("로봇 잠금 완료 알림 수신 - MAC: {}", mac);
        try {
            transactionTemplate.executeWithoutResult(status -> {
                // 1. 로봇 정보 조회
                Robot robot = robotRepository.findByMacAddress(mac)
                        .orElseThrow(() -> new RuntimeException("로봇을 찾을 수 없습니다: " + mac));

                // 2. 해당 로봇의 UNLOCKED 상태 미션 조회 (잠금 해제 후 짐 적재 완료)
                Mission mission = missionRepository.findByRobotAndStatus(robot, MissionStatus.UNLOCKED)
                        .orElseThrow(() -> new RuntimeException("잠금 해제 상태의 미션을 찾을 수 없습니다. MAC: " + mac));

                log.info("로봇 잠금 성공 처리 - MAC: {}, Mission: {}, User: {}", mac, mission.getId(), mission.getUser().getId());

                // 3. 잠금 완료 이벤트 발행 (이 이벤트를 SSE 핸들러가 수신함)
                eventPublisher.publishEvent(new MissionLockedEvent(
                        mission.getUser().getId(),
                        mission.getId(),
                        robot.getMacAddress()
                ));
            });
        } catch (Exception e) {
            log.error("잠금 완료 처리 실패 - MAC: {}, Error: {}", mac, e.getMessage());
        }
    }

    /**
     * 로봇 열림 완료 처리
     * Topic: robot/{MAC}/unlocked
     * Payload: {} (빈 페이로드 - 로봇은 missionId를 모름)
     */
    public void handleUnlocked(String mac, String payload) {
        log.info("로봇 열림(Unlock) 완료 응답 수신 - MAC: {}", mac);
        try {
            transactionTemplate.executeWithoutResult(status -> {
                // 1. 로봇 정보 조회
                Robot robot = robotRepository.findByMacAddress(mac)
                        .orElseThrow(() -> new RuntimeException("로봇을 찾을 수 없습니다: " + mac));

                // 2. 해당 로봇의 ARRIVED 상태 미션 조회 (도착 후 잠금 해제 요청)
                Mission mission = missionRepository.findByRobotAndStatus(robot, MissionStatus.ARRIVED)
                        .orElseThrow(() -> new RuntimeException("도착 상태의 미션을 찾을 수 없습니다. MAC: " + mac));

                log.info("로봇 잠금 해제 성공 - MAC: {}, MissionId: {}, UserId: {}", mac, mission.getId(), mission.getUser().getId());

                // 3. 열림 완료 이벤트 발행 (MissionUnlockedEvent)
                eventPublisher.publishEvent(new MissionUnlockedEvent(
                        mission.getUser().getId(),
                        mission.getId(),
                        robot.getMacAddress()
                ));
            });
        } catch (Exception e) {
            log.error("열림 완료 처리 중 오류 발생 - MAC: {}, Error: {}", mac, e.getMessage());
        }
    }
}
