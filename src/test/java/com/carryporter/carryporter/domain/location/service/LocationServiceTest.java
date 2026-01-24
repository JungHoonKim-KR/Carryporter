package com.carryporter.carryporter.domain.location.service;

import com.carryporter.carryporter.domain.location.entity.Location;
import com.carryporter.carryporter.domain.location.repository.LocationRepository;
import com.carryporter.carryporter.global.exception.BusinessException;
import com.carryporter.carryporter.support.IntegrationTestSupport;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LocationServiceTest extends IntegrationTestSupport {

    @Autowired
    LocationRepository locationRepository;

    @Autowired
    LocationService locationService;

    @Autowired
    EntityManager em;

    @DisplayName("위치를 조회할 수 있다.")
    @Test
    void findById() {

        // given
        Location location = Location.builder()
                .locationName("test1")
                .description("desc 1")
                .build();

        Long savedId = locationRepository.save(location);

        flushAndClear();

        // when
        Location findLocation = locationService.findById(savedId);

        // then
        assertThat(findLocation.getLocationName()).isEqualTo(location.getLocationName());
        assertThat(findLocation.getDescription()).isEqualTo(location.getDescription());
    }

    @DisplayName("없는 위치를 조회할 경우 예외가 발생한다.")
    @Test
    void findNotExistLocation() {
        // given
        Long notExistId = 9999L;

        // when then
        assertThatThrownBy(() -> locationService.findById(notExistId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("해당 위치를 조회할 수 없습니다.");
    }

    private void flushAndClear() {
        em.flush();
        em.clear();
    }
}