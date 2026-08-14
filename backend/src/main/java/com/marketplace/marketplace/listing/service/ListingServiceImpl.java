package com.marketplace.marketplace.listing.service;

import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.category.repository.CategoryRepository;
import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.listing.dto.request.CreateListingRequest;
import com.marketplace.marketplace.listing.dto.request.UpdateListingRequest;
import com.marketplace.marketplace.listing.dto.response.ListingResponse;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import com.marketplace.marketplace.listing.repository.ListingRepository;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListingServiceImpl
        implements ListingService {

    private final ListingRepository listingRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public ListingResponse create(
            CreateListingRequest request) {

        User seller = getCurrentUser();

        Category category = getCategory(request.categoryId());

        Listing listing = new Listing();

        listing.setSeller(seller);
        listing.setCategory(category);

        listing.setTitle(
                request.title().trim());

        listing.setDescription(
                request.description().trim());

        listing.setPrice(request.price());

        listing.setCondition(
                request.condition());

        listing.setLocation(
                trimToNull(request.location()));

        listing.setCurrency("LKR");

        listing.setStatus(
                ListingStatus.DRAFT);

        return toResponse(
                listingRepository.save(listing));
    }

    @Override
    @Transactional(readOnly = true)
    public ListingResponse getById(UUID id) {

        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Listing not found."));

        return toResponse(listing);
    }

    @Override
    @Transactional
    public ListingResponse update(
            UUID id,
            UpdateListingRequest request) {

        Listing listing = getOwnedListing(id);

        if (listing.getStatus() == ListingStatus.SOLD
                || listing.getStatus() == ListingStatus.DELETED) {

            throw new ConflictException(
                    "This listing cannot be updated.");
        }

        if (request.categoryId() != null) {

            listing.setCategory(
                    getCategory(request.categoryId()));
        }

        if (request.title() != null) {
            listing.setTitle(
                    request.title().trim());
        }

        if (request.description() != null) {
            listing.setDescription(
                    request.description().trim());
        }

        if (request.price() != null) {
            listing.setPrice(request.price());
        }

        if (request.condition() != null) {
            listing.setCondition(
                    request.condition());
        }

        if (request.location() != null) {
            listing.setLocation(
                    trimToNull(request.location()));
        }

        return toResponse(
                listingRepository.save(listing));
    }

    @Override
    @Transactional
    public void delete(UUID id) {

        Listing listing = getOwnedListing(id);

        listing.setStatus(
                ListingStatus.DELETED);

        listingRepository.save(listing);
    }

    @Override
    @Transactional
    public ListingResponse publish(UUID id) {

        Listing listing = getOwnedListing(id);

        if (listing.getStatus() != ListingStatus.DRAFT) {

            throw new ConflictException(
                    "Only draft listings can be published.");
        }

        listing.setStatus(
                ListingStatus.ACTIVE);

        listing.setPublishedAt(
                OffsetDateTime.now());

        return toResponse(
                listingRepository.save(listing));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ListingResponse> getMyListings(
            Pageable pageable) {

        UUID userId = SecurityUtils.getCurrentUserId();

        return listingRepository
                .findAllBySellerId(
                        userId,
                        pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ListingResponse> getActiveListings(
            Pageable pageable) {

        return listingRepository
                .findAllByStatus(
                        ListingStatus.ACTIVE,
                        pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ListingResponse> getByCategory(
            UUID categoryId,
            Pageable pageable) {

        return listingRepository
                .findAllByCategoryIdAndStatus(
                        categoryId,
                        ListingStatus.ACTIVE,
                        pageable)
                .map(this::toResponse);
    }

    private Listing getOwnedListing(UUID id) {

        UUID userId = SecurityUtils.getCurrentUserId();

        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Listing not found."));

        if (!listing.getSeller()
                .getId()
                .equals(userId)) {

            throw new ResourceNotFoundException(
                    "Listing not found.");
        }

        return listing;
    }

    private User getCurrentUser() {

        UUID userId = SecurityUtils.getCurrentUserId();

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found."));
    }

    private Category getCategory(UUID id) {

        return categoryRepository.findById(id)
                .filter(Category::isActive)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found."));
    }

    private ListingResponse toResponse(
            Listing listing) {

        return new ListingResponse(
                listing.getId(),
                listing.getSeller().getId(),
                listing.getSeller().getUsername(),
                listing.getCategory().getId(),
                listing.getCategory().getName(),
                listing.getTitle(),
                listing.getDescription(),
                listing.getPrice(),
                listing.getCurrency(),
                listing.getCondition(),
                listing.getLocation(),
                listing.getStatus(),
                listing.getViewCount(),
                listing.getFavoriteCount(),
                listing.getPublishedAt(),
                listing.getCreatedAt(),
                listing.getUpdatedAt());
    }

    private String trimToNull(String value) {

        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }
}