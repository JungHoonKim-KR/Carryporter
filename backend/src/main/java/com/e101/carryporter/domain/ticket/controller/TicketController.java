package com.e101.carryporter.domain.ticket.controller;

import com.e101.carryporter.domain.ticket.controller.dto.response.TicketOcrResponseDto;
import com.e101.carryporter.domain.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketOcrResponseDto> scanTicket(
            @RequestPart("file") MultipartFile file,
            @RequestAttribute("userId") Long userId) {

        log.info("Ticket scan request - userId: {}, filename: {}", userId, file.getOriginalFilename());

        TicketOcrResponseDto response = ticketService.scanTicket(file, userId);

        return ResponseEntity.ok(response);
    }
}
