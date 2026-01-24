package com.carryporter.carryporter.domain.robot.entity;

import com.carryporter.carryporter.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "robots")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Robot extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "robot_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String robotCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RobotStatus robotStatus;

    @Builder
    private Robot(String robotCode, RobotStatus robotStatus) {
        this.robotCode = robotCode;
        this.robotStatus = robotStatus;
    }
}
