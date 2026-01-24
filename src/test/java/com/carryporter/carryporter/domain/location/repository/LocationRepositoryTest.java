package com.carryporter.carryporter.domain.location.repository;

import com.carryporter.carryporter.domain.location.entity.Location;
import com.carryporter.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class LocationRepositoryTest extends IntegrationTestSupport {

    @Autowired
    LocationRepository locationRepository;

    @Autowired
    EntityManager em;

    @DisplayName("location 을 저장할 수 있다.")
    @Test
    void save() {

        // given
        Location location = createLocation("test name", "test description");
        Long savedId = locationRepository.save(location);

        flushAndClear();

        // when
        Location findLocation = locationRepository.findById(savedId)
                .orElseThrow(EntityNotFoundException::new);

        // then
        assertThat(findLocation.getLocationName()).isEqualTo(location.getLocationName());
        assertThat(findLocation.getDescription()).isEqualTo(location.getDescription());
    }

    @DisplayName("존재하지 않는 location 조회시 빈 optional 이 반환된다.")
    @Test
    void findByNotExistsLocationId() {
        // given
        Long notExistsLocationId = 9999L;

        // when
        Optional<Location> findLocationOpt = locationRepository.findById(notExistsLocationId);

        // then
        assertThat(findLocationOpt).isEmpty();
    }

    private Location createLocation(String locationName, String description) {
        return Location.builder()
                .locationName(locationName)
                .description(description)
                .build();
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}