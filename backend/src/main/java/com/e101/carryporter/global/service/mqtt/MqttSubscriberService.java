package com.e101.carryporter.global.service.mqtt;

import com.e101.carryporter.domain.mission.entity.Mission;
import com.e101.carryporter.domain.mission.entity.MissionStatus;
import com.e101.carryporter.domain.mission.repository.MissionRepository;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.robot.event.RobotArrivalEvent;
import com.e101.carryporter.domain.robot.event.RobotReturnedEvent;
import com.e101.carryporter.domain.robot.repository.RobotRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MqttSubscriberService {

    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final RobotRepository robotRepository;
    private final MissionRepository missionRepository;

    /**
     * MQTT 메시지 수신 처리 (mqttInputChannel로 들어오는 모든 메시지)
     */
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<?> message) {
        String topic = (String) message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC);
        String payload = (String) message.getPayload();

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
                case "status":
                    handleStatus(mac, payload);
                    break;
                case "arrived":
                    handleArrived(mac, payload);
                    break;
                case "delivered":
                    handleDelivered(mac, payload);
                    break;
                case "error":
                    handleError(mac, payload);
                    break;
                case "returned":
                    handleReturned(mac, payload);
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
            JsonNode node = objectMapper.readTree(payload);
            // TODO: 로봇 등록 비즈니스 로직 구현
            // robotService.registerRobot(mac);
            log.info("로봇 등록 완료 - MAC: {}", mac);
        } catch (Exception e) {
            log.error("로봇 등록 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
        }
    }

    /**
     * 상태 보고 처리 (Heartbeat)
     * Topic: robot/{MAC}/status
     * Payload: {"bat": 80, "x": 10, "y": 20}
     */
    private void handleStatus(String mac, String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            int battery = node.has("bat") ? node.get("bat").asInt() : -1;
            double x = node.has("x") ? node.get("x").asDouble() : 0;
            double y = node.has("y") ? node.get("y").asDouble() : 0;

            log.debug("로봇 상태 보고 - MAC: {}, 배터리: {}%, 위치: ({}, {})", mac, battery, x, y);
            // TODO: 로봇 상태 업데이트 비즈니스 로직 구현
            // robotService.updateStatus(mac, battery, x, y);
        } catch (Exception e) {
            log.error("상태 보고 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
        }
    }

    /**
     * 도착 알림 처리
     * Topic: robot/{MAC}/arrived
     * Payload: {"missionId": 101}
     * RobotArrivalEvent를 발행하려면 userId와 robotCode가 필요
     */
    private void handleArrived(String mac, String payload) {
        log.info("로봇 도착 알림 - MAC: {}", mac);
        try {
            JsonNode node = objectMapper.readTree(payload);
            long missionId = node.has("missionId") ? node.get("missionId").asLong() : -1;

            if (missionId == -1) {
                log.error("payload에 missionId가 없습니다. MAC : {}", mac);
                return;
            }

            Mission mission = missionRepository.findById(missionId)
                    .orElseThrow(() -> new EntityNotFoundException("Mission not found: " + missionId));

            // 1. 보안 검증
            if (!mission.getRobot().getMacAddress().equals(mac)) {
                log.warn("MAC 주소 불일치! 요청: {}, 미션로봇: {}", mac, mission.getRobot().getMacAddress());
                return;
            }

//            // 2. ✅ 상태 검증 추가 (이미 끝난 미션 방지)
//            // 미션 상태가 어떠할 때 이미 끝난 미션인지 판단? -> 코드 추가하면 테스트도 추가하기
//            if (mission.getMissionStatus() != MissionStatus.ARRIVED) {
//                log.info("이미 완료된 미션입니다. 무시합니다.");
//                return;
//            }


            log.info("로봇 도착 이벤트 발행 - missionId: {}, userId: {}", missionId, mission.getUser().getId());

            eventPublisher.publishEvent(new RobotArrivalEvent(
                    mission.getId(),
                    mission.getUser().getId(),
                    mission.getRobot().getRobotCode()
            ));

        } catch (Exception e) {
            log.error("도착 알림 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
        }
    }

    /**
     * 배송 완료 처리
     * Topic: robot/{MAC}/delivered
     * Payload: {"missionId": 101}
     */
    private void handleDelivered(String mac, String payload) {
        log.info("배송 완료 알림 - MAC: {}", mac);
        try {
            JsonNode node = objectMapper.readTree(payload);
            long missionId = node.has("missionId") ? node.get("missionId").asLong() : -1;

            log.info("배송 완료 - MAC: {}, missionId: {}", mac, missionId);
            // TODO: 배송 완료 비즈니스 로직 구현
            // missionService.handleDelivered(missionId);
        } catch (Exception e) {
            log.error("배송 완료 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
        }
    }

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
     * Topic: robot/{MAC}/returned
     * Payload: {"missionId": 101}
     */
    private void handleReturned(String mac, String payload) {
        log.info("로봇 관리소 복귀 알림 - MAC: {}", mac);
        try {
            JsonNode node = objectMapper.readTree(payload);
            long missionId = node.has("missionId") ? node.get("missionId").asLong() : -1;

            Robot robot = robotRepository.findByMacAddress(mac)
                    .orElseThrow(() -> new RuntimeException("로봇을 찾을 수 없습니다: " + mac));

            log.info("로봇 관리소 복귀 - MAC: {}, missionId: {}, robotId: {}", mac, missionId, robot.getId());

            eventPublisher.publishEvent(new RobotReturnedEvent(missionId, robot.getId(), mac));
        } catch (Exception e) {
            log.error("관리소 복귀 처리 실패 - MAC: {}, error: {}", mac, e.getMessage());
        }
    }
}
