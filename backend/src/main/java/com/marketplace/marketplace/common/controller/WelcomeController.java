package com.marketplace.marketplace.common.controller;

import com.marketplace.marketplace.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class WelcomeController {

    @GetMapping("/")
    public ApiResponse<?> home() {

        return ApiResponse.success(
                "Marketplace Backend Running",
                Map.of(
                        "version", "1.0.0",
                        "status", "UP"));

    }

}