package com.e101.carryporter.domain.userlocker.entity;

import com.e101.carryporter.domain.locker.entity.Locker;
import com.e101.carryporter.domain.user.entity.User;
import com.e101.carryporter.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "user_lockers")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserLocker extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_locker_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locker_id", nullable = false)
    private Locker locker;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserLockerStatus userLockerStatus;

    @Builder
    private UserLocker(User user, Locker locker, UserLockerStatus userLockerStatus) {
        this.user = user;
        this.locker = locker;
        this.userLockerStatus = userLockerStatus;
    }
    public static UserLocker createUserLocker(User user, Locker locker) {
        return UserLocker.builder()
                .user(user)
                .locker(locker)
                .userLockerStatus(UserLockerStatus.USING) // 초기 상태값 설정
                .build();
    }
}
