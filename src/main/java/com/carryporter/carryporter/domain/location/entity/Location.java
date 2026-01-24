package com.carryporter.carryporter.domain.location.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "locations")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Location {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String locationName;

    private String description;

    @Builder
    private Location(String locationName, String description) {
        this.locationName = locationName;
        this.description = description;
    }
}
