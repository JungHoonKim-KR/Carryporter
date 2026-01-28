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
    private Double positionX;

    @Column(nullable = false)
    private Double positionY;

    public static Location createLocation(String locationName, String description, Double positionX, Double positionY) {
        return Location.builder()
                .locationName(locationName)
                .description(description)
                .positionX(positionX)
                .positionY(positionY)
                .build();
    }

    @Builder
    private Location(String locationName, String description, Double positionX, Double positionY) {
        this.locationName = locationName;
        this.description = description;
        this.positionX = positionX;
        this.positionY = positionY;
    }
}
