package com.marketplace.marketplace.chat.controller;

import com.marketplace.marketplace.chat.dto.AiAnswerResponse;
import com.marketplace.marketplace.chat.dto.AskAiRequest;
import com.marketplace.marketplace.chat.service.ChatAiService;
import com.marketplace.marketplace.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ChatController {

    private final ChatAiService chatAiService;

    @PostMapping("/chat/ask")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<AiAnswerResponse> ask(@Valid @RequestBody AskAiRequest request) {
        return ApiResponse.success(
                "AI answer generated successfully.",
                chatAiService.answer(request));
    }

    @GetMapping("/chat/health")
    public ApiResponse<String> health() {
        return ApiResponse.success(
                "AI chat service is running.",
                "ok");
    }
}
