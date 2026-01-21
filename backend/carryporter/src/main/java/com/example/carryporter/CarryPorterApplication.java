package com.example.carryporter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // <-- 이거 필수!
public class CarryPorterApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarryPorterApplication.class, args);
    }

}
