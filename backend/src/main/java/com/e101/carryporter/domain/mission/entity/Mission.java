package com.e101.carryporter.domain.mission.entity;

import com.e101.carryporter.domain.location.entity.Location;
import com.e101.carryporter.domain.robot.entity.Robot;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.global.entity.BaseEntity;
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
public class Mission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    // 새로운 미션 생성
    public static Mission createMission(User user, Location startLocation, Location endLocation) {
        return Mission.builder()
                .user(user)
                .startLocation(startLocation)
                .endLocation(endLocation)
                .missionStatus(MissionStatus.REQUESTED)
                .build();
    }

    @Builder
    private Mission(User user, Location startLocation, Location endLocation, MissionStatus missionStatus) {
        this.user = user;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.missionStatus = missionStatus;
    }

}
