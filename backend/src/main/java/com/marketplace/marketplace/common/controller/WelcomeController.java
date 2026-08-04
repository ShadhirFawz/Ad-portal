package com.marketplace.marketplace.common.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class WelcomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "application", "Marketplace Backend",
                "status", "Running");
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "UP");
    }
}