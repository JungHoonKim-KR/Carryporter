package com.e101.carryporter.domain.user.entity;

import com.e101.carryporter.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String mmEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public static User createUser(String mmEmail) {
        return User.builder()
                .mmEmail(mmEmail)
                .role(Role.BASIC)
                .build();
    }

    @Builder
    private User(String mmEmail, Role role) {
        this.mmEmail = mmEmail;
        this.role = role;
    }

}
