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
import com.marketplace.marketplace.listing.enums.ListingLocationType;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import com.marketplace.marketplace.listing.enums.ListingType;
import com.marketplace.marketplace.listing.enums.ModerationStatus;
import com.marketplace.marketplace.listing.enums.PricingType;
import com.marketplace.marketplace.listing.repository.ListingRepository;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
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

                Category category = getCategoryForListing(request.categoryId());

                Listing listing = new Listing();

                listing.setSeller(seller);
                listing.setCategory(category);

                listing.setListingType(
                                request.listingType() != null
                                                ? request.listingType()
                                                : ListingType.ITEM);

                listing.setTitle(
                                request.title().trim());

                listing.setDescription(
                                request.description().trim());

                listing.setPrice(
                                request.price() != null
                                                ? request.price()
                                                : BigDecimal.ZERO);

                listing.setPricingType(request.pricingType());

                listing.setNegotiable(
                                Boolean.TRUE.equals(request.negotiable()));

                listing.setMinimumOfferPrice(
                                request.minimumOfferPrice());

                listing.setCondition(
                                request.condition());

                int quantity = request.quantity() != null
                                ? request.quantity()
                                : 1;

                listing.setQuantity(quantity);
                listing.setAvailableQuantity(quantity);
                listing.setReservedQuantity(0);

                listing.setLocationType(
                                request.locationType() != null
                                                ? request.locationType()
                                                : ListingLocationType.CITY);

                listing.setDistrict(
                                trimToNull(request.district()));

                listing.setProvince(
                                trimToNull(request.province()));

                listing.setCity(
                                trimToNull(request.city()));

                listing.setPostalCode(
                                trimToNull(request.postalCode()));

                listing.setCustomAttributes(
                                request.customAttributes() != null
                                                ? request.customAttributes()
                                                : new HashMap<>());

                listing.setCurrency("LKR");

                listing.setStatus(
                                ListingStatus.DRAFT);

                listing.setModerationStatus(
                                ModerationStatus.NOT_REQUIRED);

                validatePricing(
                                request.pricingType(),
                                request.price(),
                                request.negotiable(),
                                request.minimumOfferPrice());

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
                                        getCategoryForListing(request.categoryId()));
                }

                if (request.title() != null) {
                        listing.setTitle(
                                        request.title().trim());
                }

                if (request.description() != null) {
                        listing.setDescription(
                                        request.description().trim());
                }

                // Resolve effective pricing values (request overrides existing)
                PricingType effectivePricingType = request.pricingType() != null
                                ? request.pricingType()
                                : listing.getPricingType();

                BigDecimal effectivePrice = request.price() != null
                                ? request.price()
                                : listing.getPrice();

                Boolean effectiveNegotiable = request.negotiable() != null
                                ? request.negotiable()
                                : listing.isNegotiable();

                BigDecimal effectiveMinimumOfferPrice = request.minimumOfferPrice() != null
                                ? request.minimumOfferPrice()
                                : listing.getMinimumOfferPrice();

                validatePricing(
                                effectivePricingType,
                                effectivePrice,
                                effectiveNegotiable,
                                effectiveMinimumOfferPrice);

                if (request.pricingType() != null) {
                        listing.setPricingType(request.pricingType());
                }

                if (request.price() != null) {
                        listing.setPrice(request.price());
                }

                if (request.negotiable() != null) {
                        listing.setNegotiable(request.negotiable());
                }

                if (request.minimumOfferPrice() != null) {
                        listing.setMinimumOfferPrice(request.minimumOfferPrice());
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

                if (listing.getStatus() == ListingStatus.SOLD) {

                        throw new ConflictException(
                                        "Sold listings cannot be deleted.");
                }

                if (listing.getStatus() == ListingStatus.DELETED) {

                        return;
                }

                UUID currentUserId = SecurityUtils.getCurrentUserId();

                listing.setStatus(
                                ListingStatus.DELETED);

                listing.setDeletedAt(
                                OffsetDateTime.now());

                listing.setDeletionReason(
                                "Deleted by seller");

                listing.setDeletedBy(
                                userRepository.getReferenceById(
                                                currentUserId));

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

                validateForPublication(listing);

                OffsetDateTime now = OffsetDateTime.now();

                listing.setStatus(
                                ListingStatus.ACTIVE);

                listing.setPublishedAt(now);
                listing.setLastPublishedAt(now);

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

        private void validatePricing(
                        PricingType pricingType,
                        BigDecimal price,
                        Boolean negotiable,
                        BigDecimal minimumOfferPrice) {

                if (pricingType == PricingType.FREE) {

                        if (price != null
                                        && price.compareTo(BigDecimal.ZERO) != 0) {

                                throw new ConflictException(
                                                "Free listings cannot have a price.");
                        }

                        return;
                }

                if (pricingType == PricingType.CONTACT_FOR_PRICE) {

                        if (price != null
                                        && price.compareTo(BigDecimal.ZERO) != 0) {

                                throw new ConflictException(
                                                "Contact-for-price listings cannot have a price.");
                        }

                        return;
                }

                if (price == null) {

                        throw new ConflictException(
                                        "Price is required for this pricing type.");
                }

                if (Boolean.TRUE.equals(negotiable)
                                && minimumOfferPrice != null
                                && minimumOfferPrice.compareTo(price) > 0) {

                        throw new ConflictException(
                                        "Minimum offer price cannot exceed listing price.");
                }
        }

        private void validateForPublication(
                        Listing listing) {

                if (listing.getCategory() == null
                                || !listing.getCategory().isActive()
                                || !listing.getCategory().isAllowListings()) {

                        throw new ConflictException(
                                        "The selected category is not available.");
                }

                if (listing.getTitle() == null
                                || listing.getTitle().isBlank()) {

                        throw new ConflictException(
                                        "A title is required before publishing.");
                }

                if (listing.getDescription() == null
                                || listing.getDescription().isBlank()) {

                        throw new ConflictException(
                                        "A description is required before publishing.");
                }

                if (listing.getQuantity() == null
                                || listing.getQuantity() <= 0) {

                        throw new ConflictException(
                                        "A valid quantity is required.");
                }

                if (listing.getAvailableQuantity() == null
                                || listing.getAvailableQuantity() <= 0) {

                        throw new ConflictException(
                                        "At least one item must be available.");
                }
        }

        private Category getCategoryForListing(UUID id) {

                Category category = categoryRepository.findById(id)
                                .filter(Category::isActive)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found."));

                if (!category.isAllowListings()) {

                        throw new ConflictException(
                                        "Listings are not allowed in this category.");
                }

                return category;
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