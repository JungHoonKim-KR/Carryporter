package com.e101.carryporter.domain.robot.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "robots")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Robot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "robot_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String robotCode;

    @Column(unique = true, nullable = true)
    private String macAddress;

    @Enumerated(EnumType.STRING)
    private RobotStatus status;

    public static Robot createRobot(String robotCode, String macAddress) {
        return Robot.builder()
                .robotCode(robotCode)
                .macAddress(macAddress)
                .status(RobotStatus.IDLE)
                .build();
    }

    @Builder
    private Robot(String robotCode, String macAddress, RobotStatus status) {
        this.robotCode = robotCode;
        this.macAddress = macAddress;
        this.status = status;
    }
}
