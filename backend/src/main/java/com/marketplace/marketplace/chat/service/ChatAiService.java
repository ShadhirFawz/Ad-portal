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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.sql.ResultSet;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatAiService {

    private final JdbcTemplate jdbcTemplate;
    private final ListingRepository listingRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "about", "above", "after", "again", "all", "am", "an", "and", "any", "are", "as", "at",
            "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
            "can", "could", "did", "do", "does", "doing", "down", "during",
            "each", "few", "for", "from", "further",
            "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
            "i", "if", "in", "into", "is", "it", "its", "itself",
            "just", "me", "more", "most", "my", "myself",
            "no", "nor", "not", "now",
            "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
            "same", "she", "should", "so", "some", "such",
            "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
            "under", "until", "up", "very",
            "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would",
            "you", "your", "yours", "yourself", "yourselves",
            "show", "find", "get", "tell", "recommend", "looking", "want", "need", "buy", "sell", "available", "please", "item", "items"
    );

    private static final Pattern WORD_PATTERN = Pattern.compile("[\\p{Punct}\\s]+");

    @Value("${app.ai.rag.enabled:true}")
    private boolean ragEnabled;

    @Value("${app.ai.model:gemini-1.5-flash}")
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
            log.info("AI RAG is disabled via configuration.");
            return new AiAnswerResponse(
                    "AI RAG is currently disabled. Set `app.ai.rag.enabled=true` in application-ai.yml to enable the chat assistant.",
                    List.of(),
                    model,
                    "disabled",
                    "RAG disabled via configuration.");
        }

        List<AiSearchResult> sources = searchMarketplaceKnowledge(question, limit, minScore);
        String answer = generateAnswer(question, sources);

        return new AiAnswerResponse(
                answer,
                sources,
                model,
                sources.isEmpty() ? "none" : "hybrid-semantic-retrieval",
                "Retrieved from live marketplace listings, categories, and sellers.");
    }

    private List<AiSearchResult> searchMarketplaceKnowledge(String question, int limit, double minScore) {
        // If question is formatted as a vector string (e.g. "[0.12, 0.45, ...]"), use pgvector table
        if (question.startsWith("[") && question.endsWith("]")) {
            List<AiSearchResult> vectorResults = runVectorSearch(question, limit, minScore);
            if (!vectorResults.isEmpty()) {
                return vectorResults;
            }
        }

        // Live contextual hybrid keyword & semantic ranking across database
        return searchLiveMarketplace(question, limit);
    }

    private List<AiSearchResult> runVectorSearch(String vectorString, int limit, double minScore) {
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
                        1 - (embedding <=> ?::vector) AS score
                    FROM marketplace_rag_documents
                    WHERE 1 - (embedding <=> ?::vector) >= ?
                    ORDER BY embedding <=> ?::vector
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
                            out.add(new Object[]{
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
                    vectorString,
                    vectorString,
                    minScore,
                    vectorString,
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
        } catch (Exception ex) {
            log.debug("Vector search not available or empty: {}", ex.getMessage());
        }

        return results;
    }

    private List<AiSearchResult> searchLiveMarketplace(String question, int limit) {
        String normalizedQuery = question.toLowerCase(Locale.ROOT).trim();
        List<String> keywords = extractKeywords(normalizedQuery);

        record ScoredItem(AiSearchResult result, double score) {}
        List<ScoredItem> scoredItems = new ArrayList<>();

        // 1. Search Active Listings
        try {
            List<Listing> listings = listingRepository.findAll().stream()
                    .filter(listing -> listing.getStatus() != null && "ACTIVE".equalsIgnoreCase(listing.getStatus().name()))
                    .toList();

            for (Listing listing : listings) {
                double score = calculateListingScore(listing, normalizedQuery, keywords);
                if (score > 0.0) {
                    String subtitle = formatListingSubtitle(listing);
                    String content = formatListingContent(listing);
                    String url = "/listings/" + (listing.getSlug() != null ? listing.getSlug() : listing.getId());

                    AiSearchResult item = new AiSearchResult(
                            listing.getId(),
                            listing.getTitle(),
                            "listing",
                            subtitle,
                            content,
                            url,
                            Math.min(0.99, score / 100.0)
                    );
                    scoredItems.add(new ScoredItem(item, score));
                }
            }
        } catch (Exception ex) {
            log.error("Failed querying listings for AI search: {}", ex.getMessage(), ex);
        }

        // 2. Search Categories
        try {
            List<Category> categories = categoryRepository.findAll();
            for (Category category : categories) {
                double score = calculateCategoryScore(category, normalizedQuery, keywords);
                if (score > 0.0) {
                    String url = "/listings?category=" + (category.getSlug() != null ? category.getSlug() : category.getId());
                    AiSearchResult item = new AiSearchResult(
                            category.getId(),
                            category.getName(),
                            "category",
                            "Product Category",
                            category.getDescription() != null ? category.getDescription() : "Explore listings in " + category.getName(),
                            url,
                            Math.min(0.85, score / 100.0)
                    );
                    scoredItems.add(new ScoredItem(item, score));
                }
            }
        } catch (Exception ex) {
            log.error("Failed querying categories for AI search: {}", ex.getMessage(), ex);
        }

        // 3. Search Sellers / Users
        try {
            List<User> users = userRepository.findAll();
            for (User user : users) {
                double score = calculateUserScore(user, normalizedQuery, keywords);
                if (score > 0.0) {
                    String fullName = buildFullName(user);
                    String url = "/profile/" + (user.getUsername() != null ? user.getUsername() : user.getId());
                    AiSearchResult item = new AiSearchResult(
                            user.getId(),
                            fullName.isBlank() ? (user.getUsername() != null ? user.getUsername() : "Seller") : fullName,
                            "seller",
                            user.getBusinessName() != null ? user.getBusinessName() : "Marketplace Seller",
                            user.getBio() != null ? user.getBio() : "Verified seller on Wudo Marketplace.",
                            url,
                            Math.min(0.80, score / 100.0)
                    );
                    scoredItems.add(new ScoredItem(item, score));
                }
            }
        } catch (Exception ex) {
            log.error("Failed querying users for AI search: {}", ex.getMessage(), ex);
        }

        // Sort descending by score
        scoredItems.sort((a, b) -> Double.compare(b.score(), a.score()));

        List<AiSearchResult> results = scoredItems.stream()
                .map(ScoredItem::result)
                .limit(limit)
                .collect(Collectors.toList());

        // If no matches found (e.g. conversational prompt "Hello", "What's available?"), provide latest listings
        if (results.isEmpty()) {
            try {
                results = listingRepository.findAll().stream()
                        .filter(l -> l.getStatus() != null && "ACTIVE".equalsIgnoreCase(l.getStatus().name()))
                        .sorted((a, b) -> {
                            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                            return b.getCreatedAt().compareTo(a.getCreatedAt());
                        })
                        .limit(Math.min(limit, 4))
                        .map(listing -> new AiSearchResult(
                                listing.getId(),
                                listing.getTitle(),
                                "listing",
                                formatListingSubtitle(listing),
                                formatListingContent(listing),
                                "/listings/" + (listing.getSlug() != null ? listing.getSlug() : listing.getId()),
                                0.50
                        ))
                        .collect(Collectors.toList());
            } catch (Exception ignored) {
            }
        }

        return results;
    }

    private List<String> extractKeywords(String text) {
        String[] tokens = WORD_PATTERN.split(text);
        List<String> keywords = new ArrayList<>();
        for (String token : tokens) {
            String clean = token.trim();
            if (clean.length() >= 2 && !STOP_WORDS.contains(clean)) {
                keywords.add(clean);
            }
        }
        return keywords;
    }

    private double calculateListingScore(Listing listing, String query, List<String> keywords) {
        String title = listing.getTitle() != null ? listing.getTitle().toLowerCase(Locale.ROOT) : "";
        String desc = listing.getDescription() != null ? listing.getDescription().toLowerCase(Locale.ROOT) : "";
        String categoryName = (listing.getCategory() != null && listing.getCategory().getName() != null)
                ? listing.getCategory().getName().toLowerCase(Locale.ROOT) : "";
        String location = (listing.getLocation() != null ? listing.getLocation() : "") + " "
                + (listing.getCity() != null ? listing.getCity() : "") + " "
                + (listing.getDistrict() != null ? listing.getDistrict() : "");
        location = location.toLowerCase(Locale.ROOT);

        double score = 0.0;

        // Exact query substring match
        if (!query.isBlank() && title.contains(query)) {
            score += 60.0;
        } else if (!query.isBlank() && desc.contains(query)) {
            score += 30.0;
        }

        // Keyword matches
        for (String kw : keywords) {
            if (title.contains(kw)) {
                score += 15.0;
            }
            if (categoryName.contains(kw)) {
                score += 12.0;
            }
            if (location.contains(kw)) {
                score += 10.0;
            }
            if (desc.contains(kw)) {
                score += 4.0;
            }
        }

        return score;
    }

    private double calculateCategoryScore(Category category, String query, List<String> keywords) {
        String name = category.getName() != null ? category.getName().toLowerCase(Locale.ROOT) : "";
        String desc = category.getDescription() != null ? category.getDescription().toLowerCase(Locale.ROOT) : "";

        double score = 0.0;
        if (!query.isBlank() && name.contains(query)) {
            score += 40.0;
        }
        for (String kw : keywords) {
            if (name.contains(kw)) {
                score += 15.0;
            }
            if (desc.contains(kw)) {
                score += 4.0;
            }
        }
        return score;
    }

    private double calculateUserScore(User user, String query, List<String> keywords) {
        String fullName = buildFullName(user).toLowerCase(Locale.ROOT);
        String username = user.getUsername() != null ? user.getUsername().toLowerCase(Locale.ROOT) : "";
        String business = user.getBusinessName() != null ? user.getBusinessName().toLowerCase(Locale.ROOT) : "";

        double score = 0.0;
        if (!query.isBlank() && (fullName.contains(query) || username.contains(query) || business.contains(query))) {
            score += 35.0;
        }
        for (String kw : keywords) {
            if (fullName.contains(kw) || username.contains(kw) || business.contains(kw)) {
                score += 12.0;
            }
        }
        return score;
    }

    private String formatListingSubtitle(Listing listing) {
        StringBuilder sb = new StringBuilder();
        if (listing.getPrice() != null) {
            sb.append("LKR ").append(String.format("%,.2f", listing.getPrice()));
            if (listing.isNegotiable()) {
                sb.append(" (Negotiable)");
            }
        }
        if (listing.getCity() != null && !listing.getCity().isBlank()) {
            if (!sb.isEmpty()) sb.append(" • ");
            sb.append(listing.getCity());
        } else if (listing.getLocation() != null && !listing.getLocation().isBlank()) {
            if (!sb.isEmpty()) sb.append(" • ");
            sb.append(listing.getLocation());
        }
        if (listing.getCondition() != null) {
            if (!sb.isEmpty()) sb.append(" • ");
            sb.append(listing.getCondition().name().replace('_', ' '));
        }
        return sb.toString();
    }

    private String formatListingContent(Listing listing) {
        StringBuilder sb = new StringBuilder();
        if (listing.getPrice() != null) {
            sb.append("Price: ").append(listing.getCurrency() != null ? listing.getCurrency() : "LKR")
              .append(" ").append(String.format("%,.2f", listing.getPrice()));
            if (listing.isNegotiable()) sb.append(" (Negotiable)");
            sb.append("\n");
        }
        if (listing.getCategory() != null && listing.getCategory().getName() != null) {
            sb.append("Category: ").append(listing.getCategory().getName()).append("\n");
        }
        String loc = (listing.getLocation() != null ? listing.getLocation() : "")
                + (listing.getCity() != null ? ", " + listing.getCity() : "")
                + (listing.getDistrict() != null ? ", " + listing.getDistrict() : "");
        if (!loc.isBlank()) {
            sb.append("Location: ").append(loc.trim()).append("\n");
        }
        if (listing.getCondition() != null) {
            sb.append("Condition: ").append(listing.getCondition().name().replace('_', ' ')).append("\n");
        }
        if (listing.getDescription() != null && !listing.getDescription().isBlank()) {
            sb.append("Description: ").append(listing.getDescription());
        }
        return sb.toString().trim();
    }

    private String generateAnswer(String question, List<AiSearchResult> sources) {
        if (sources == null || sources.isEmpty()) {
            return "I could not find any active listings, categories, or sellers matching that query.\n\n"
                    + "Try searching by product keywords (e.g., 'MacBook Pro', 'Toyota Corolla'), a category (e.g., 'Electronics', 'Vehicles'), or a location (e.g., 'Colombo', 'Kandy').";
        }

        String prompt = buildPrompt(question, sources);

        try {
            String llmAnswer = callLlm(prompt);
            if (llmAnswer != null && !llmAnswer.isBlank()) {
                return llmAnswer;
            }
        } catch (Exception ex) {
            log.warn("External LLM generation failed, falling back to structured summary: {}", ex.getMessage());
        }

        // High quality grounded fallback if LLM is unreachable
        StringBuilder builder = new StringBuilder();
        builder.append("Here are the top marketplace results matching your request:\n\n");

        for (int i = 0; i < Math.min(sources.size(), 5); i++) {
            AiSearchResult item = sources.get(i);
            builder.append(i + 1).append(". **[").append(item.title()).append("](").append(item.url()).append(")**");
            if (item.subtitle() != null && !item.subtitle().isBlank()) {
                builder.append("\n   - ").append(item.subtitle());
            }
            if (item.content() != null && !item.content().isBlank()) {
                builder.append("\n   - ").append(trimToSentence(item.content(), 160));
            }
            builder.append("\n\n");
        }

        builder.append("You can click on any listing above to view complete details, photos, or contact the seller directly.");
        return builder.toString();
    }

    private String buildPrompt(String question, List<AiSearchResult> sources) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are Wudo AI, an intelligent, helpful concierge for the Wudo Marketplace.\n");
        prompt.append("Your goal is to assist the user by answering their question using only the verified marketplace sources below.\n\n");
        prompt.append("User Question: ").append(question).append("\n\n");
        prompt.append("Verified Marketplace Context:\n");

        for (int i = 0; i < sources.size(); i++) {
            AiSearchResult src = sources.get(i);
            prompt.append("\n--- Source ").append(i + 1).append(" ---\n");
            prompt.append("Title: ").append(src.title()).append("\n");
            prompt.append("Type: ").append(src.type()).append("\n");
            if (src.subtitle() != null) prompt.append("Details: ").append(src.subtitle()).append("\n");
            if (src.content() != null) prompt.append("Content: ").append(src.content()).append("\n");
            if (src.url() != null) prompt.append("Link: ").append(src.url()).append("\n");
        }

        prompt.append("\nInstructions for response:\n");
        prompt.append("1. Be conversational, natural, and helpful with authentic marketplace expertise.\n");
        prompt.append("2. Ground every single claim in the sources provided. Never invent fictional products or prices.\n");
        prompt.append("3. Always mention the price (in LKR) and location if available in the context.\n");
        prompt.append("4. Embed markdown links to the listings where appropriate using [Listing Title](/listings/slug).\n");
        prompt.append("5. If comparing multiple items, highlight their differences in price, condition, or location.\n");
        prompt.append("6. If the sources do not fully answer the question, acknowledge that politely and suggest realistic next steps.\n");

        return prompt.toString();
    }

    private String callLlm(String prompt) {
        if ("gemini".equalsIgnoreCase(provider) && geminiApiKey != null && !geminiApiKey.isBlank()) {
            String url = geminiBaseUrl + "/v1beta/models/" + model + ":generateContent?key=" + geminiApiKey;
            return callGemini(prompt, url);
        }

        if ("openrouter".equalsIgnoreCase(provider) && openRouterApiKey != null && !openRouterApiKey.isBlank()) {
            String url = openRouterBaseUrl + "/chat/completions";
            return callOpenRouter(prompt, url, openRouterApiKey);
        }

        log.warn("No active LLM provider configured with API key.");
        return null;
    }

    private String callGemini(String prompt, String url) {
        try {
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
        } catch (Exception ex) {
            log.error("Gemini API call failed: {}", ex.getMessage());
            throw ex;
        }

        return null;
    }

    private String callOpenRouter(String prompt, String url, String key) {
        try {
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
        } catch (Exception ex) {
            log.error("OpenRouter API call failed: {}", ex.getMessage());
            throw ex;
        }
    }

    private String trimToSentence(String value, int maxLen) {
        if (value == null) return "";
        String clean = value.replaceAll("\\s+", " ").trim();
        if (clean.length() <= maxLen) return clean;
        return clean.substring(0, Math.max(0, maxLen - 3)).trim() + "...";
    }

    private String buildFullName(User user) {
        if (user == null) return "";
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        return (first + " " + last).trim();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiResponse(List<GeminiCandidate> candidates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiCandidate(GeminiContent content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiContent(List<GeminiPart> parts) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiPart(String text) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OpenRouterResponse(List<OpenRouterChoice> choices) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OpenRouterChoice(OpenRouterMessage message) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OpenRouterMessage(String content) {}
}
