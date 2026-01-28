package com.e101.carryporter.domain.auth.dto.service;

public record VerifyAuthCommand(String email, Integer code) {}