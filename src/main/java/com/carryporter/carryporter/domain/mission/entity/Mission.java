package com.carryporter.carryporter.domain.mission.entity;

import com.carryporter.carryporter.domain.location.entity.Location;
import com.carryporter.carryporter.domain.robot.entity.Robot;
import com.carryporter.carryporter.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "missions")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Mission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mission_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "robot_id")
    private Robot robot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="start_location_id", nullable = false)
    private Location startLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="end_location_id", nullable = false)
    private Location endLocation;

    private Double finalWeight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MissionStatus missionStatus;

    // robot 할당시간
    private LocalDateTime assignedAt;

    // robot 주행 시작시간
    private LocalDateTime startedAt;

    // 로봇 목적지 도착시간
    private LocalDateTime arrivedAt;

    // 미션 완료시간
    private LocalDateTime finishedAt;

    public static Mission createMission(User user, Location startLocation, Location endLocation) {
        return Mission.builder()
                .user(user)
                .startLocation(startLocation)
                .endLocation(endLocation)
                .missionStatus(MissionStatus.REQUESTED)
                .build();
    }

    @Builder
    private Mission(User user, Robot robot, User admin, Location startLocation, Location endLocation, Double finalWeight, MissionStatus missionStatus, LocalDateTime assignedAt, LocalDateTime startedAt, LocalDateTime arrivedAt, LocalDateTime finishedAt) {
        this.user = user;
        this.robot = robot;
        this.admin = admin;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.finalWeight = finalWeight;
        this.missionStatus = missionStatus;
        this.assignedAt = assignedAt;
        this.startedAt = startedAt;
        this.arrivedAt = arrivedAt;
        this.finishedAt = finishedAt;
    }

    // 상태 변경 메서드
    public void updateStatus(MissionStatus status) {
        this.missionStatus = status;
    }

    public void finish() {
        this.missionStatus = MissionStatus.FINISHED;
        this.finishedAt = LocalDateTime.now();
    }
}
