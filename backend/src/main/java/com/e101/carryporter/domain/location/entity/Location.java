package com.e101.carryporter.domain.location.entity;


import com.e101.carryporter.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "locations")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Location extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String locationName;

    private String description;

    @Column(nullable = false)
    private Double x;

    @Column(nullable = false)
    private Double y;

    public static Location createLocation(String locationName, String description, Double x, Double y) {
        return Location.builder()
                .locationName(locationName)
                .description(description)
                .x(x)
                .y(y)
                .build();
    }

    @Builder
    private Location(String locationName, String description, Double x, Double y) {
        this.locationName = locationName;
        this.description = description;
        this.x = x;
        this.y = y;
    }
}
