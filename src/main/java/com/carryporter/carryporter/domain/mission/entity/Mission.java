package com.carryporter.carryporter.domain.mission.entity;

import com.carryporter.carryporter.domain.location.Location;
import com.carryporter.carryporter.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "missions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Mission extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mission_id")
    private Long missionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "start_location_id", nullable = false)
    private Location startLocation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dest_location_id", nullable = false)
    private Location destLocation;

    @Column(name = "final_weight", nullable = false)
    private Double finalWeight;

    @Enumerated(EnumType.STRING)
    @Column(name = "mission_status", nullable = false)
    private MissionStatus missionStatus;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Builder
    public Mission(Location startLocation, Location destLocation,
                   Double finalWeight, MissionStatus missionStatus, LocalDateTime assignedAt,
                   LocalDateTime startedAt, LocalDateTime arrivedAt, LocalDateTime finishedAt) {
        this.startLocation = startLocation;
        this.destLocation = destLocation;
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