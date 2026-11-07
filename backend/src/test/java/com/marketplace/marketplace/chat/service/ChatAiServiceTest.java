package com.marketplace.marketplace.chat.service;

import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.category.repository.CategoryRepository;
import com.marketplace.marketplace.chat.dto.AiAnswerResponse;
import com.marketplace.marketplace.chat.dto.AskAiRequest;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.enums.ListingCondition;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import com.marketplace.marketplace.listing.repository.ListingRepository;
import com.marketplace.marketplace.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatAiServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private ListingRepository listingRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    private ChatAiService chatAiService;

    @BeforeEach
    void setUp() {
        chatAiService = new ChatAiService(jdbcTemplate, listingRepository, categoryRepository, userRepository);
        ReflectionTestUtils.setField(chatAiService, "ragEnabled", true);
        ReflectionTestUtils.setField(chatAiService, "model", "gemini-1.5-flash");
        ReflectionTestUtils.setField(chatAiService, "topK", 6);
        ReflectionTestUtils.setField(chatAiService, "provider", "gemini");
        ReflectionTestUtils.setField(chatAiService, "geminiApiKey", ""); // empty so it falls back to structured summary
                                                                         // safely without network
    }

    @Test
    void shouldThrowWhenQuestionIsBlank() {
        AskAiRequest emptyRequest = new AskAiRequest("   ", 6, 0.02);
        assertThrows(IllegalArgumentException.class, () -> chatAiService.answer(emptyRequest));
    }

    @Test
    void shouldReturnMatchesWhenQueryMatchesActiveListing() {
        Listing listing = new Listing();
        listing.setId(UUID.randomUUID());
        listing.setTitle("Apple iPhone 15 Pro Max");
        listing.setSlug("apple-iphone-15-pro-max");
        listing.setDescription("Brand new sealed pack in Colombo");
        listing.setPrice(new BigDecimal("350000.00"));
        listing.setCurrency("LKR");
        listing.setCondition(ListingCondition.NEW);
        listing.setLocation("Colombo 03");
        listing.setCity("Colombo");
        listing.setStatus(ListingStatus.ACTIVE);

        Category category = new Category();
        category.setId(UUID.randomUUID());
        category.setName("Electronics");
        category.setSlug("electronics");
        listing.setCategory(category);

        when(listingRepository.findAll()).thenReturn(List.of(listing));
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(userRepository.findAll()).thenReturn(List.of());

        AskAiRequest request = new AskAiRequest("Do you have any iPhone in Colombo?", 5, 0.02);
        AiAnswerResponse response = chatAiService.answer(request);

        assertNotNull(response);
        assertFalse(response.sources().isEmpty(), "Expected at least one matching source");
        assertEquals("Apple iPhone 15 Pro Max", response.sources().getFirst().title());
        assertTrue(response.answer().contains("Apple iPhone 15 Pro Max"));
    }

    @Test
    void shouldReturnDisabledMessageWhenRagDisabled() {
        ReflectionTestUtils.setField(chatAiService, "ragEnabled", false);
        AskAiRequest request = new AskAiRequest("Any laptops?", 5, 0.02);
        AiAnswerResponse response = chatAiService.answer(request);

        assertNotNull(response);
        assertEquals("disabled", response.retrievalStrategy());
        assertTrue(response.answer().contains("disabled"));
    }
}
