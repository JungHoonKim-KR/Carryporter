package com.example.carryporter.repository;

import com.example.carryporter.entity.TestMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestMessageRepository extends JpaRepository<TestMessage, Long> {
}
