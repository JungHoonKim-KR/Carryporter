package com.carryporter.carryporter.domain.location.service;

import com.carryporter.carryporter.domain.location.entity.Location;
import com.carryporter.carryporter.domain.location.exception.LocationErrorCode;
import com.carryporter.carryporter.domain.location.repository.LocationRepository;
import com.carryporter.carryporter.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    public Location findById(Long locationId){
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new BusinessException(LocationErrorCode.LOCATION_NOT_FOUND_EXCEPTION));
    }

}
