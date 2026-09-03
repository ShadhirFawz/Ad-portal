package com.marketplace.marketplace.listing.service.impl;

import com.marketplace.marketplace.category.dto.response.CategoryBreadcrumbResponse;
import com.marketplace.marketplace.category.entity.Category;
import com.marketplace.marketplace.category.repository.CategoryRepository;
import com.marketplace.marketplace.category.service.CategoryService;
import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.listing.dto.request.CreateListingRequest;
import com.marketplace.marketplace.listing.dto.request.ListingFilterParams;
import com.marketplace.marketplace.listing.dto.request.UpdateListingRequest;
import com.marketplace.marketplace.listing.dto.response.ListingFavoriteResponse;
import com.marketplace.marketplace.listing.dto.response.ListingImageResponse;
import com.marketplace.marketplace.listing.dto.response.ListingResponse;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.entity.ListingFavorite;
import com.marketplace.marketplace.listing.entity.ListingStats;
import com.marketplace.marketplace.listing.enums.ListingLocationType;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import com.marketplace.marketplace.listing.enums.ListingType;
import com.marketplace.marketplace.listing.enums.ModerationStatus;
import com.marketplace.marketplace.listing.enums.PricingType;
import com.marketplace.marketplace.listing.mapper.ListingImageMapper;
import com.marketplace.marketplace.listing.repository.ListingFavoriteRepository;
import com.marketplace.marketplace.listing.repository.ListingImageRepository;
import com.marketplace.marketplace.listing.repository.ListingRepository;
import com.marketplace.marketplace.listing.repository.ListingSpecification;
import com.marketplace.marketplace.listing.repository.ListingStatsRepository;
import com.marketplace.marketplace.listing.service.ListingService;
import com.marketplace.marketplace.auction.repository.AuctionRepository;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListingServiceImpl implements ListingService {

        private final ListingRepository listingRepository;
        private final CategoryRepository categoryRepository;
        private final CategoryService categoryService;
        private final UserRepository userRepository;
        private final ListingImageRepository imageRepository;
        private final ListingImageMapper imageMapper;
        private final ListingFavoriteRepository listingFavoriteRepository;
        private final ListingStatsRepository listingStatsRepository;
        private final AuctionRepository auctionRepository;

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

                listing.setSlug(
                                generateUniqueSlug(request.title(), null));

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

                Listing saved = listingRepository.save(listing);
                listingStatsRepository.save(new ListingStats(saved.getId(), 0L));

                return toResponse(saved, false, false, 0L, 0L);
        }

        @Override
        @Transactional
        public ListingResponse getById(UUID id) {

                Listing listing = listingRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Listing not found."));

                listingStatsRepository.incrementViewCount(listing.getId());
                long viewCount = listingStatsRepository.findViewCountByListingId(listing.getId()).orElse(1L);
                long favoriteCount = listingFavoriteRepository.countByListingId(listing.getId());
                boolean isFavorited = isListingFavoritedByCurrentUser(listing.getId());

                boolean includeSellerContact = com.marketplace.marketplace.common.security.util.SecurityUtils
                                .getCurrentUserOptional()
                                .isPresent();

                return toResponse(listing, includeSellerContact, isFavorited, viewCount, favoriteCount);
        }

        @Override
        @Transactional
        public ListingResponse getBySlug(String slug) {

                Listing listing = listingRepository.findBySlug(slug)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Listing not found: " + slug));

                listingStatsRepository.incrementViewCount(listing.getId());
                long viewCount = listingStatsRepository.findViewCountByListingId(listing.getId()).orElse(1L);
                long favoriteCount = listingFavoriteRepository.countByListingId(listing.getId());
                boolean isFavorited = isListingFavoritedByCurrentUser(listing.getId());

                boolean includeSellerContact = com.marketplace.marketplace.common.security.util.SecurityUtils
                                .getCurrentUserOptional()
                                .isPresent();

                return toResponse(listing, includeSellerContact, isFavorited, viewCount, favoriteCount);
        }

        @Override
        @Transactional
        public ListingResponse getByIdOrSlug(String idOrSlug) {

                Listing listing = resolveListing(idOrSlug);

                listingStatsRepository.incrementViewCount(listing.getId());
                long viewCount = listingStatsRepository.findViewCountByListingId(listing.getId()).orElse(1L);
                long favoriteCount = listingFavoriteRepository.countByListingId(listing.getId());
                boolean isFavorited = isListingFavoritedByCurrentUser(listing.getId());

                boolean includeSellerContact = com.marketplace.marketplace.common.security.util.SecurityUtils
                                .getCurrentUserOptional()
                                .isPresent();

                return toResponse(listing, includeSellerContact, isFavorited, viewCount, favoriteCount);
        }

        @Override
        @Transactional
        public ListingFavoriteResponse toggleFavorite(String idOrSlug) {

                User currentUser = getCurrentUser();
                Listing listing = resolveListing(idOrSlug);

                Optional<ListingFavorite> existing = listingFavoriteRepository
                                .findByUserIdAndListingId(currentUser.getId(), listing.getId());

                boolean isFavorited;
                if (existing.isPresent()) {
                        listingFavoriteRepository.delete(existing.get());
                        isFavorited = false;
                } else {
                        ListingFavorite favorite = new ListingFavorite(currentUser, listing);
                        listingFavoriteRepository.save(favorite);
                        isFavorited = true;
                }

                long favoriteCount = listingFavoriteRepository.countByListingId(listing.getId());

                return new ListingFavoriteResponse(listing.getId(), isFavorited, favoriteCount);
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
                        String newTitle = request.title().trim();
                        if (!newTitle.equals(listing.getTitle()) || listing.getSlug() == null) {
                                listing.setSlug(generateUniqueSlug(newTitle, listing.getId()));
                        }
                        listing.setTitle(newTitle);
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

                if (request.listingType() != null) {
                        listing.setListingType(request.listingType());
                }

                if (request.condition() != null) {
                        listing.setCondition(
                                        request.condition());
                }

                if (request.quantity() != null) {
                        listing.setQuantity(request.quantity());
                }

                if (request.locationType() != null) {
                        listing.setLocationType(request.locationType());
                }

                if (request.city() != null) {
                        listing.setCity(trimToNull(request.city()));
                }

                if (request.district() != null) {
                        listing.setDistrict(trimToNull(request.district()));
                }

                if (request.province() != null) {
                        listing.setProvince(trimToNull(request.province()));
                }

                if (request.postalCode() != null) {
                        listing.setPostalCode(trimToNull(request.postalCode()));
                }

                if (request.location() != null) {
                        listing.setLocation(
                                        trimToNull(request.location()));
                }

                if (request.customAttributes() != null) {
                        listing.setCustomAttributes(request.customAttributes());
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

                Page<Listing> page = listingRepository.findAllBySellerId(userId, pageable);
                return mapToResponsePage(page);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<ListingResponse> getActiveListings(
                        Pageable pageable) {

                return getActiveListings(null, pageable);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<ListingResponse> getActiveListings(
                        ListingFilterParams params,
                        Pageable pageable) {

                Page<Listing> page = listingRepository.findAll(ListingSpecification.buildSpec(params), pageable);
                return mapToResponsePage(page);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<ListingResponse> getListingsByUsername(
                        String username,
                        Pageable pageable) {

                if (username == null || username.isBlank()) {
                        return Page.empty(pageable);
                }

                Page<Listing> page = listingRepository.findAllBySellerUsernameIgnoreCaseAndStatus(
                                username.trim(),
                                ListingStatus.ACTIVE,
                                pageable);
                return mapToResponsePage(page);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<ListingResponse> getByCategory(
                        UUID categoryId,
                        Pageable pageable) {

                List<UUID> categoryIds = categoryService.getSelfAndDescendantCategoryIds(categoryId);

                Page<Listing> page = listingRepository.findAllByCategoryIdInAndStatus(
                                categoryIds,
                                ListingStatus.ACTIVE,
                                pageable);
                return mapToResponsePage(page);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<ListingResponse> getByCategory(
                        String categoryIdOrSlug,
                        Pageable pageable) {

                UUID categoryId = categoryService.resolveCategoryId(categoryIdOrSlug);
                return getByCategory(categoryId, pageable);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<ListingResponse> getSimilarListings(
                        String categoryIdOrSlug,
                        String excludeId,
                        Pageable pageable) {

                UUID categoryId = categoryService.resolveCategoryId(categoryIdOrSlug);

                UUID excludeUuid = null;
                if (excludeId != null && !excludeId.isBlank()) {
                        try {
                                excludeUuid = UUID.fromString(excludeId);
                        } catch (IllegalArgumentException ignored) {
                                // excludeId is a slug — resolve to UUID
                                excludeUuid = listingRepository.findBySlug(excludeId)
                                                .map(Listing::getId)
                                                .orElse(null);
                        }
                }

                Page<Listing> page = (excludeUuid != null)
                                ? listingRepository.findAllByCategoryIdAndStatusAndIdNot(
                                                categoryId,
                                                ListingStatus.ACTIVE,
                                                excludeUuid,
                                                pageable)
                                : listingRepository.findAllByCategoryIdAndStatus(
                                                categoryId,
                                                ListingStatus.ACTIVE,
                                                pageable);

                return mapToResponsePage(page);
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
                String tokenEmail = SecurityUtils.getCurrentUserEmail();

                return userRepository.findById(userId)
                                .map(existingUser -> {
                                        if (existingUser.getEmail() != null
                                                        && existingUser.getEmail().startsWith("user-")
                                                        && tokenEmail != null
                                                        && !tokenEmail.isBlank()
                                                        && !tokenEmail.startsWith("user-")) {
                                                existingUser.setEmail(tokenEmail.trim());
                                                return userRepository.save(existingUser);
                                        }
                                        return existingUser;
                                })
                                .orElseGet(() -> {
                                        String email = (tokenEmail != null && !tokenEmail.isBlank())
                                                        ? tokenEmail.trim()
                                                        : ("user-" + userId + "@marketplace.com");

                                        User user = User.builder()
                                                        .email(email)
                                                        .firstName("User")
                                                        .role(com.marketplace.marketplace.common.enums.Role.USER)
                                                        .status(com.marketplace.marketplace.common.enums.UserStatus.ACTIVE)
                                                        .emailVerified(true)
                                                        .phoneVerified(false)
                                                        .publicProfile(true)
                                                        .lastLoginAt(OffsetDateTime.now(java.time.ZoneOffset.UTC))
                                                        .build();
                                        user.setId(userId);
                                        user.setIsNew(true);
                                        return userRepository.save(user);
                                });
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

                long imageCount = imageRepository.countByListingId(listing.getId());
                if (imageCount == 0) {
                        throw new ConflictException(
                                        "A listing must have at least one image before publishing.");
                }

                if (imageRepository.findByListingIdAndPrimaryTrue(listing.getId()).isEmpty()) {
                        throw new ConflictException(
                                        "A listing must have a primary image before publishing.");
                }
        }

        private Category getCategoryForListing(UUID id) {

                Category category = categoryRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Category not found."));

                if (!category.isActive()) {

                        throw new ConflictException(
                                        "Category is inactive.");
                }

                if (!category.isAllowListings()) {

                        throw new ConflictException(
                                        "Listings are not allowed in this category.");
                }

                validateCategoryHierarchy(category);

                return category;
        }

        private void validateCategoryHierarchy(
                        Category category) {

                Category current = category;

                while (current != null) {

                        if (!current.isActive()) {

                                throw new ConflictException(
                                                "The selected category is unavailable.");
                        }

                        current = current.getParent();
                }
        }

        private List<CategoryBreadcrumbResponse> buildCategoryBreadcrumbs(Category category) {
                if (category == null) {
                        return List.of();
                }
                List<CategoryBreadcrumbResponse> breadcrumbs = new ArrayList<>();
                Category current = category;
                while (current != null) {
                        breadcrumbs.add(0, new CategoryBreadcrumbResponse(
                                        current.getId(),
                                        current.getName(),
                                        current.getSlug(),
                                        current.getLevel()));
                        current = current.getParent();
                }
                return breadcrumbs;
        }

        private Page<ListingResponse> mapToResponsePage(Page<Listing> page) {
                if (page.isEmpty()) {
                        return page.map(l -> toResponse(l, false, false, 0L, 0L, false));
                }
                List<UUID> listingIds = page.getContent().stream().map(Listing::getId).toList();
                Set<UUID> favoritedIds = getFavoritedListingIdsForCurrentUser(listingIds);
                Map<UUID, Long> viewCounts = getViewCountsMap(listingIds);
                Map<UUID, Long> favoriteCounts = getFavoriteCountsMap(listingIds);
                Set<UUID> activeAuctionListingIds = auctionRepository
                                .findActiveAuctionListingIds(listingIds, java.time.OffsetDateTime.now());

                return page.map(listing -> toResponse(
                                listing,
                                false,
                                favoritedIds.contains(listing.getId()),
                                viewCounts.getOrDefault(listing.getId(), 0L),
                                favoriteCounts.getOrDefault(listing.getId(), 0L),
                                activeAuctionListingIds.contains(listing.getId())));
        }

        private Map<UUID, Long> getViewCountsMap(Collection<UUID> listingIds) {
                if (listingIds == null || listingIds.isEmpty()) {
                        return Collections.emptyMap();
                }
                Map<UUID, Long> map = new HashMap<>();
                List<Object[]> rows = listingStatsRepository.findViewCountsByListingIdIn(listingIds);
                for (Object[] row : rows) {
                        if (row[0] instanceof UUID id && row[1] instanceof Number count) {
                                map.put(id, count.longValue());
                        }
                }
                return map;
        }

        private Map<UUID, Long> getFavoriteCountsMap(Collection<UUID> listingIds) {
                if (listingIds == null || listingIds.isEmpty()) {
                        return Collections.emptyMap();
                }
                Map<UUID, Long> map = new HashMap<>();
                List<Object[]> rows = listingFavoriteRepository.findFavoriteCountsByListingIdIn(listingIds);
                for (Object[] row : rows) {
                        if (row[0] instanceof UUID id && row[1] instanceof Number count) {
                                map.put(id, count.longValue());
                        }
                }
                return map;
        }

        private boolean isListingFavoritedByCurrentUser(UUID listingId) {
                return SecurityUtils.getCurrentUserOptional()
                                .map(auth -> listingFavoriteRepository.existsByUserIdAndListingId(SecurityUtils.getCurrentUserId(), listingId))
                                .orElse(false);
        }

        private Set<UUID> getFavoritedListingIdsForCurrentUser(Collection<UUID> listingIds) {
                if (listingIds == null || listingIds.isEmpty()) {
                        return Collections.emptySet();
                }
                return SecurityUtils.getCurrentUserOptional()
                                .map(auth -> listingFavoriteRepository.findFavoritedListingIds(SecurityUtils.getCurrentUserId(), listingIds))
                                .orElse(Collections.emptySet());
        }

        private Listing resolveListing(String idOrSlug) {
                if (idOrSlug == null || idOrSlug.isBlank()) {
                        throw new ResourceNotFoundException("Listing identifier is required.");
                }
                try {
                        UUID id = UUID.fromString(idOrSlug);
                        Optional<Listing> byId = listingRepository.findById(id);
                        if (byId.isPresent()) {
                                return byId.get();
                        }
                } catch (IllegalArgumentException ignored) {
                }
                return listingRepository.findBySlug(idOrSlug)
                                .orElseThrow(() -> new ResourceNotFoundException("Listing not found: " + idOrSlug));
        }

        private ListingResponse toResponse(Listing listing) {
                return toResponse(listing, false);
        }

        private ListingResponse toResponse(
                        Listing listing,
                        boolean includeSellerContact) {
                long viewCount = listingStatsRepository.findViewCountByListingId(listing.getId()).orElse(0L);
                long favoriteCount = listingFavoriteRepository.countByListingId(listing.getId());
                boolean isFavorited = isListingFavoritedByCurrentUser(listing.getId());
                boolean hasActiveAuction = auctionRepository
                                .findByListingIdAndStatus(listing.getId(),
                                                com.marketplace.marketplace.auction.enums.AuctionStatus.ACTIVE)
                                .map(a -> a.getEndsAt().isAfter(java.time.OffsetDateTime.now()))
                                .orElse(false);
                return toResponse(listing, includeSellerContact, isFavorited, viewCount, favoriteCount, hasActiveAuction);
        }

        private ListingResponse toResponse(
                        Listing listing,
                        boolean includeSellerContact,
                        boolean isFavorited,
                        long viewCount,
                        long favoriteCount,
                        boolean hasActiveAuction) {

                List<ListingImageResponse> images = imageRepository
                                .findAllByListingIdOrderByDisplayOrderAsc(
                                                listing.getId())
                                .stream()
                                .map(imageMapper::toResponse)
                                .toList();

                UUID sellerId = listing.getSeller() != null ? listing.getSeller().getId() : null;
                String sellerUsername = listing.getSeller() != null ? listing.getSeller().getUsername() : "seller";
                String sellerPhoneNumber = (includeSellerContact && listing.getSeller() != null)
                                ? listing.getSeller().getPhoneNumber()
                                : null;

                UUID categoryId = listing.getCategory() != null ? listing.getCategory().getId() : null;
                String categoryName = listing.getCategory() != null ? listing.getCategory().getName() : "Uncategorized";
                List<CategoryBreadcrumbResponse> breadcrumbs = buildCategoryBreadcrumbs(listing.getCategory());

                return new ListingResponse(
                                listing.getId(),
                                sellerId,
                                sellerUsername,
                                categoryId,
                                categoryName,
                                breadcrumbs,
                                listing.getTitle(),
                                listing.getSlug(),
                                listing.getDescription(),
                                listing.getPrice(),
                                listing.getCurrency(),
                                listing.getPricingType(),
                                listing.isNegotiable(),
                                listing.getMinimumOfferPrice(),
                                listing.getListingType(),
                                listing.getCondition(),
                                listing.getQuantity(),
                                listing.getAvailableQuantity(),
                                listing.getLocationType(),
                                listing.getDistrict(),
                                listing.getProvince(),
                                listing.getCity(),
                                listing.getPostalCode(),
                                listing.getCustomAttributes(),
                                listing.getStatus(),
                                listing.getModerationStatus(),
                                viewCount,
                                favoriteCount,
                                isFavorited,
                                images,
                                listing.getPublishedAt(),
                                listing.getCreatedAt(),
                                listing.getUpdatedAt(),
                                sellerPhoneNumber,
                                hasActiveAuction);
        }

        private String generateUniqueSlug(String title, UUID listingId) {
                if (title == null || title.isBlank()) {
                        title = "listing";
                }

                // Normalize using special chars with hyphens, trim hyphens
                String normalized = title.toLowerCase(java.util.Locale.ROOT)
                                .replaceAll("[^a-z0-9]+", "-")
                                .replaceAll("^-+|-+$", "");

                if (normalized.isBlank()) {
                        normalized = "listing";
                }

                if (normalized.length() > 140) {
                        normalized = normalized.substring(0, 140).replaceAll("-+$", "");
                }

                // Check if base slug is available
                if (listingId != null) {
                        java.util.Optional<Listing> existing = listingRepository.findBySlug(normalized);
                        if (existing.isEmpty() || existing.get().getId().equals(listingId)) {
                                return normalized;
                        }
                } else if (!listingRepository.existsBySlug(normalized)) {
                        return normalized;
                }

                // Append unique suffix if duplicate
                String suffix = UUID.randomUUID().toString().substring(0, 8);
                String uniqueSlug = normalized + "-" + suffix;
                while (listingRepository.existsBySlug(uniqueSlug)) {
                        suffix = UUID.randomUUID().toString().substring(0, 8);
                        uniqueSlug = normalized + "-" + suffix;
                }
                return uniqueSlug;
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