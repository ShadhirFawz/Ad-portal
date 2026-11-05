package com.marketplace.marketplace.chat.dto;

import java.util.List;

public record AiAnswerResponse(
                String answer,
                List<AiSearchResult> sources,
                String model,
                String retrievalStrategy,
                String notes) {
}
