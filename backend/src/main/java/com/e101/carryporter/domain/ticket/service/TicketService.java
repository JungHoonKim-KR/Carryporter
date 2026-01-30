package com.e101.carryporter.domain.ticket.service;

import com.e101.carryporter.domain.ticket.controller.dto.response.TicketOcrResponseDto;
import com.e101.carryporter.domain.ticket.service.dto.OcrResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private final OcrClient ocrClient;

    public TicketOcrResponseDto scanTicket(MultipartFile file, Long userId) {
        log.info("Processing ticket scan for userId: {}", userId);

        OcrResultDto ocrResult = ocrClient.sendToOcr(file);
        return ocrResult.getData();
    }
}
