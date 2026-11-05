package com.marketplace.marketplace.chat.dto;

import java.util.UUID;

public record AiSearchResult(
                UUID id,
                String title,
                String type,
                String subtitle,
                String content,
                String url,
                Double score) {
}
