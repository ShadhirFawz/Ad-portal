package com.marketplace.marketplace.chat.dto;

public record AskAiRequest(
                String question,
                Integer limit,
                Double minScore) {
}
