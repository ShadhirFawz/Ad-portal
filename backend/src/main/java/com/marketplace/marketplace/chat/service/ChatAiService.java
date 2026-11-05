package com.marketplace.marketplace.chat.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.marketplace.marketplace.chat.dto.AiAnswerResponse;
import com.marketplace.marketplace.chat.dto.AiSearchResult;
import com.marketplace.marketplace.chat.dto.AskAiRequest;
import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.category.repository.CategoryRepository;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.repository.ListingRepository;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatAiService {

    private final JdbcTemplate jdbcTemplate;
    private final ListingRepository listingRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Value("${app.ai.rag.enabled:false}")
    private boolean ragEnabled;

    @Value("${app.ai.model:gemini-2.5-flash}")
    private String model;

    @Value("${app.ai.rag.top-k:6}")
    private int topK;

    @Value("${app.ai.provider:gemini}")
    private String provider;

    @Value("${app.ai.llm.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.llm.gemini.base-url:https://generativelanguage.googleapis.com}")
    private String geminiBaseUrl;

    @Value("${app.ai.llm.openrouter.api-key:}")
    private String openRouterApiKey;

    @Value("${app.ai.llm.openrouter.base-url:https://openrouter.ai/api/v1}")
    private String openRouterBaseUrl;

    public AiAnswerResponse answer(AskAiRequest request) {
        if (request == null || request.question() == null || request.question().isBlank()) {
            throw new IllegalArgumentException("A valid question is required.");
        }

        String question = request.question().trim();
        int limit = request.limit() != null && request.limit() > 0 ? request.limit() : topK;
        double minScore = request.minScore() != null ? request.minScore() : 0.02d;

        if (!ragEnabled) {
            return new AiAnswerResponse(
                    "AI RAG is not enabled. Add embeddings and set `app.ai.rag.enabled=true` before using the chat feature.",
                    List.of(),
                    model,
                    "disabled",
                    "The application is ready for a real RAG flow, but embeddings have not been indexed yet.");
        }

        List<AiSearchResult> sources = searchMarketplaceKnowledge(question, limit, minScore);
        String answer = generateAnswer(question, sources);

        return new AiAnswerResponse(
                answer,
                sources,
                model,
                "pgvector-similarity",
                "Retrieved from indexed listing and category metadata with semantic similarity.");
    }

    private List<AiSearchResult> searchMarketplaceKnowledge(String question, int limit, double minScore) {
        String sql = """
                SELECT
                    id,
                    title,
                    type,
                    subtitle,
                    content,
                    url,
                    score
                FROM (
                    SELECT
                        id,
                        title,
                        type,
                        subtitle,
                        content,
                        url,
                        1 - (embedding <=> ?) AS score
                    FROM marketplace_rag_documents
                    WHERE 1 - (embedding <=> ?) >= ?
                    ORDER BY embedding <=> ?
                    LIMIT ?
                ) ranked
                ORDER BY score DESC
                """;

        List<AiSearchResult> results = new ArrayList<>();

        try {
            List<Object[]> rows = jdbcTemplate.query(
                    sql,
                    (ResultSet rs) -> {
                        List<Object[]> out = new ArrayList<>();
                        while (rs.next()) {
                            out.add(new Object[] {
                                    UUID.fromString(rs.getString("id")),
                                    rs.getString("title"),
                                    rs.getString("type"),
                                    rs.getString("subtitle"),
                                    rs.getString("content"),
                                    rs.getString("url"),
                                    rs.getDouble("score")
                            });
                        }
                        return out;
                    },
                    question,
                    question,
                    minScore,
                    question,
                    limit);

            for (Object[] row : rows) {
                results.add(new AiSearchResult(
                        (UUID) row[0],
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        (String) row[4],
                        (String) row[5],
                        ((Number) row[6]).doubleValue()));
            }
        } catch (Exception ignored) {
            results.addAll(runFallbackSearch(question, limit));
        }

        return results;
    }

    private List<AiSearchResult> runFallbackSearch(String question, int limit) {
        String q = question.toLowerCase(Locale.ROOT);
        List<AiSearchResult> out = new ArrayList<>();

        List<Listing> listings = listingRepository.findAll().stream()
                .filter(listing -> listing.getStatus() != null && listing.getStatus().name().equals("ACTIVE"))
                .toList();

        for (Listing listing : listings) {
            String haystack = (listing.getTitle() + " " + listing.getDescription() + " " + listing.getLocation() + " "
                    + listing.getDistrict() + " " + listing.getCity()).toLowerCase(Locale.ROOT);
            if (haystack.contains(q) || q.contains(haystack)) {
                out.add(new AiSearchResult(
                        listing.getId(),
                        listing.getTitle(),
                        "listing",
                        listing.getCategory() != null ? listing.getCategory().getName() : "Marketplace listing",
                        listing.getDescription(),
                        "/listings/" + listing.getSlug(),
                        0.75d));
            }
            if (out.size() >= limit) {
                break;
            }
        }

        if (out.size() < limit) {
            List<Category> categories = categoryRepository.findAll();
            for (Category category : categories) {
                String haystack = (category.getName() + " " + category.getDescription()).toLowerCase(Locale.ROOT);
                if (haystack.contains(q) || q.contains(haystack)) {
                    out.add(new AiSearchResult(
                            category.getId(),
                            category.getName(),
                            "category",
                            "Marketplace category",
                            category.getDescription() == null ? "General product category." : category.getDescription(),
                            "/listings?category=" + category.getSlug(),
                            0.65d));
                }
                if (out.size() >= limit) {
                    break;
                }
            }
        }

        if (out.size() < limit) {
            List<User> users = userRepository.findAll();
            for (User user : users) {
                String fullName = buildFullName(user);
                String text = ((fullName + " " + user.getBusinessName() + " " + user.getBio())
                        .toLowerCase(Locale.ROOT));
                if (text.contains(q)) {
                    out.add(new AiSearchResult(
                            user.getId(),
                            fullName.isBlank() ? "Seller" : fullName,
                            "seller",
                            user.getBusinessName() == null ? "Verified seller" : user.getBusinessName(),
                            user.getBio() == null ? "Seller information." : user.getBio(),
                            "/profile/" + user.getUsername(),
                            0.60d));
                }
                if (out.size() >= limit) {
                    break;
                }
            }
        }

        return out;
    }

    private String generateAnswer(String question, List<AiSearchResult> sources) {
        if (sources == null || sources.isEmpty()) {
            return "I could not find a strong match in the marketplace content for that question. Try asking about a product category, listing, or seller details."
                    + "\n\nSuggested follow-up: 'Show me affordable laptops in Colombo' or 'Find furniture sellers in Kandy'.";
        }

        String prompt = buildPrompt(question, sources);

        try {
            String llmAnswer = callLlm(prompt);
            if (llmAnswer != null && !llmAnswer.isBlank()) {
                return llmAnswer;
            }
        } catch (Exception ignored) {
            // intentionally fallback to structured answer when external model calls are
            // unavailable.
        }

        StringBuilder builder = new StringBuilder();
        builder.append("Based on the marketplace data, here is the most relevant information:\n\n");

        for (int i = 0; i < Math.min(sources.size(), 5); i++) {
            AiSearchResult item = sources.get(i);
            builder.append(i + 1)
                    .append(". ")
                    .append(item.title())
                    .append(" (")
                    .append(item.type())
                    .append(")\n");

            if (item.subtitle() != null && !item.subtitle().isBlank()) {
                builder.append("   - ").append(item.subtitle()).append("\n");
            }
            if (item.content() != null && !item.content().isBlank()) {
                builder.append("   - ").append(trimToSentence(item.content(), 180)).append("\n");
            }
            if (item.url() != null && !item.url().isBlank()) {
                builder.append("   - View: ").append(item.url()).append("\n");
            }
        }

        builder.append(
                "\nTo get more exact results, rephrase your question with a location, category, budget, or product feature.");
        return builder.toString();
    }

    private String buildPrompt(String question, List<AiSearchResult> sources) {
        StringBuilder prompt = new StringBuilder();
        prompt.append(
                "You are the assistant for the Wudo marketplace. Use only the provided source context to answer the user's question.\n\n");
        prompt.append("Question: ").append(question).append("\n\n");
        prompt.append("Context:\n");

        for (int i = 0; i < sources.size(); i++) {
            AiSearchResult src = sources.get(i);
            prompt.append("\n[Source ").append(i + 1).append("]\n");
            prompt.append("Title: ").append(src.title()).append("\n");
            prompt.append("Type: ").append(src.type()).append("\n");
            if (src.subtitle() != null) {
                prompt.append("Subtitle: ").append(src.subtitle()).append("\n");
            }
            if (src.content() != null) {
                prompt.append("Content: ").append(src.content()).append("\n");
            }
            if (src.url() != null) {
                prompt.append("Url: ").append(src.url()).append("\n");
            }
        }

        prompt.append(
                "\nInstructions: answer in a concise, practical marketplace voice; include relevant prices, categories, and locations when the context provides them; if context is weak, say so honestly; do not invent facts.\n");
        return prompt.toString();
    }

    private String callLlm(String prompt) {
        String key = "";
        String url = "";

        if ("gemini".equalsIgnoreCase(provider) && geminiApiKey != null && !geminiApiKey.isBlank()) {
            key = geminiApiKey;
            url = geminiBaseUrl + "/v1beta/models/" + model + ":generateContent?key=" + key;
            return callGemini(prompt, url);
        }

        if ("openrouter".equalsIgnoreCase(provider) && openRouterApiKey != null && !openRouterApiKey.isBlank()) {
            key = openRouterApiKey;
            url = openRouterBaseUrl + "/chat/completions";
            return callOpenRouter(prompt, url, key);
        }

        return null;
    }

    private String callGemini(String prompt, String url) {
        Map<String, Object> payload = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(Map.of("text", prompt)));
        payload.put("contents", List.of(content));

        GeminiResponse response = RestClient.builder().build().post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(GeminiResponse.class);

        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return null;
        }

        for (GeminiCandidate candidate : response.candidates()) {
            if (candidate.content() != null && candidate.content().parts() != null) {
                for (GeminiPart part : candidate.content().parts()) {
                    if (part.text() != null && !part.text().isBlank()) {
                        return part.text();
                    }
                }
            }
        }

        return null;
    }

    private String callOpenRouter(String prompt, String url, String key) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("messages", List.of(Map.of("role", "user", "content", prompt)));

        OpenRouterResponse response = RestClient.builder().build().post()
                .uri(url)
                .header("Authorization", "Bearer " + key)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(OpenRouterResponse.class);

        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            return null;
        }

        return response.choices().getFirst().message().content();
    }

    private String trimToSentence(String value, int maxLen) {
        if (value == null) {
            return "";
        }
        String clean = value.replaceAll("\\s+", " ").trim();
        if (clean.length() <= maxLen) {
            return clean;
        }
        return clean.substring(0, Math.max(0, maxLen - 3)).trim() + "...";
    }

    private String buildFullName(User user) {
        if (user == null) {
            return "";
        }
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        return (first + " " + last).trim();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiResponse(List<GeminiCandidate> candidates) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiCandidate(GeminiContent content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiContent(List<GeminiPart> parts) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiPart(String text) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OpenRouterResponse(List<OpenRouterChoice> choices) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OpenRouterChoice(OpenRouterMessage message) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OpenRouterMessage(String content) {
    }
}
