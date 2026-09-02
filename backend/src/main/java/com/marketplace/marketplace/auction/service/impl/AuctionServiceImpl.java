package com.marketplace.marketplace.auction.service.impl;

import com.marketplace.marketplace.auction.dto.request.PlaceBidRequest;
import com.marketplace.marketplace.auction.dto.response.AuctionBidDetail;
import com.marketplace.marketplace.auction.dto.response.AuctionBidderPreview;
import com.marketplace.marketplace.auction.dto.response.AuctionPublicResponse;
import com.marketplace.marketplace.auction.dto.response.AuctionSellerResponse;
import com.marketplace.marketplace.auction.dto.response.PlaceBidResponse;
import com.marketplace.marketplace.auction.entity.Auction;
import com.marketplace.marketplace.auction.entity.AuctionBid;
import com.marketplace.marketplace.auction.enums.AuctionStatus;
import com.marketplace.marketplace.auction.repository.AuctionBidRepository;
import com.marketplace.marketplace.auction.repository.AuctionRepository;
import com.marketplace.marketplace.auction.service.AuctionService;
import com.marketplace.marketplace.common.exception.BadRequestException;
import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.common.storage.SupabaseStorageService;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import com.marketplace.marketplace.listing.enums.PricingType;
import com.marketplace.marketplace.listing.repository.ListingRepository;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuctionServiceImpl implements AuctionService {

    private static final String PROFILE_BUCKET = "profile-images";
    private static final int TOP_PARTICIPANT_AVATARS = 5;

    private final AuctionRepository auctionRepository;
    private final AuctionBidRepository auctionBidRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService storageService;

    @Override
    @Transactional
    public AuctionPublicResponse startAuction(UUID listingId) {
        User seller = getCurrentUser();
        Listing listing = getListing(listingId);

        if (!listing.getSeller().getId().equals(seller.getId())) {
            throw new ResourceNotFoundException("Listing not found.");
        }

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new ConflictException("Only active listings can start an auction.");
        }

        if (!isAuctionEligible(listing)) {
            throw new ConflictException(
                    "Auctions can only be started on negotiable listings with a set price.");
        }

        if (auctionRepository.findByListingIdAndStatus(listingId, AuctionStatus.ACTIVE).isPresent()) {
            throw new ConflictException("This listing already has an active auction.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        Auction auction = new Auction();
        auction.setListing(listing);
        auction.setSeller(seller);
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setStartedAt(now);
        auction.setEndsAt(now.plusHours(24));

        auction = auctionRepository.save(auction);
        return toPublicResponse(auction, Optional.of(seller.getId()));
    }

    @Override
    @Transactional
    public AuctionPublicResponse getAuctionForListing(UUID listingId) {
        getListing(listingId);

        Auction auction = auctionRepository
                .findTopByListingIdOrderByCreatedAtDesc(listingId)
                .map(this::closeIfExpired)
                .orElse(null);

        if (auction == null) {
            return null;
        }

        Optional<UUID> viewerId = SecurityUtils.getCurrentUserOptional()
                .map(user -> user.id());

        return toPublicResponse(auction, viewerId);
    }

    @Override
    @Transactional
    public AuctionSellerResponse getAuctionSellerView(UUID listingId) {
        User seller = getCurrentUser();
        Listing listing = getListing(listingId);

        if (!listing.getSeller().getId().equals(seller.getId())) {
            throw new ResourceNotFoundException("Listing not found.");
        }

        Auction auction = auctionRepository
                .findTopByListingIdOrderByCreatedAtDesc(listingId)
                .map(this::closeIfExpired)
                .orElseThrow(() -> new ResourceNotFoundException("No auction found for this listing."));

        return toSellerResponse(auction);
    }

    @Override
    @Transactional
    public PlaceBidResponse placeBid(UUID listingId, PlaceBidRequest request) {
        User bidder = getCurrentUser();
        Listing listing = getListing(listingId);

        if (listing.getSeller().getId().equals(bidder.getId())) {
            throw new BadRequestException("Listing owners cannot bid on their own auction.");
        }

        Auction auction = auctionRepository
                .findByListingIdAndStatus(listingId, AuctionStatus.ACTIVE)
                .map(this::closeIfExpired)
                .orElseThrow(() -> new BadRequestException("No active auction found for this listing."));

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new BadRequestException("This auction has ended.");
        }

        if (!auction.getEndsAt().isAfter(OffsetDateTime.now())) {
            throw new BadRequestException("This auction has ended.");
        }

        BigDecimal amount = request.amount();
        BigDecimal floorPrice = resolveFloorPrice(listing);
        Optional<AuctionBid> currentHighest = auctionBidRepository
                .findTopByAuctionIdOrderByAmountDescPlacedAtAsc(auction.getId());

        if (currentHighest.isEmpty()) {
            if (amount.compareTo(floorPrice) <= 0) {
                throw new BadRequestException(
                        "Bid must be higher than the minimum offer of " + floorPrice + ".");
            }
        } else if (amount.compareTo(currentHighest.get().getAmount()) <= 0) {
            throw new BadRequestException(
                    "Bid must be higher than the current highest bid of "
                            + currentHighest.get().getAmount() + ".");
        }

        auctionBidRepository.clearWinningFlags(auction.getId());

        AuctionBid bid = new AuctionBid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setAmount(amount);
        bid.setWinning(true);
        bid = auctionBidRepository.save(bid);

        return new PlaceBidResponse(
                bid.getId(),
                bid.getAmount(),
                bid.getAmount(),
                true);
    }

    private Listing getListing(UUID listingId) {
        return listingRepository.findById(listingId)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found."));
    }

    private User getCurrentUser() {
        UUID userId = SecurityUtils.getCurrentUserId();
        String tokenEmail = SecurityUtils.getCurrentUserEmail();

        return userRepository.findById(userId)
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

    private Auction closeIfExpired(Auction auction) {
        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            return auction;
        }

        if (!auction.getEndsAt().isBefore(OffsetDateTime.now())) {
            return auction;
        }

        auction.setStatus(AuctionStatus.CLOSED);
        auction = auctionRepository.save(auction);
        markWinningBid(auction.getId());
        return auction;
    }

    private void markWinningBid(UUID auctionId) {
        Optional<AuctionBid> highest = auctionBidRepository
                .findTopByAuctionIdOrderByAmountDescPlacedAtAsc(auctionId);

        auctionBidRepository.clearWinningFlags(auctionId);

        highest.ifPresent(bid -> {
            bid.setWinning(true);
            auctionBidRepository.save(bid);
        });
    }

    private BigDecimal resolveFloorPrice(Listing listing) {
        if (listing.getMinimumOfferPrice() != null) {
            return listing.getMinimumOfferPrice();
        }
        return listing.getPrice();
    }

    private boolean isAuctionEligible(Listing listing) {
        if (listing.getPricingType() == PricingType.FREE
                || listing.getPricingType() == PricingType.CONTACT_FOR_PRICE) {
            return false;
        }

        return listing.isNegotiable()
                || listing.getPricingType() == PricingType.NEGOTIABLE;
    }

    private AuctionPublicResponse toPublicResponse(Auction auction, Optional<UUID> viewerId) {
        UUID auctionId = auction.getId();
        boolean hasEnded = auction.getStatus() == AuctionStatus.CLOSED
                || auction.getEndsAt().isBefore(OffsetDateTime.now());

        Optional<AuctionBid> highest = auctionBidRepository
                .findTopByAuctionIdOrderByAmountDescPlacedAtAsc(auctionId);

        List<AuctionBidderPreview> latestBidders = resolveTopBiddersByHighestBid(
                auctionId,
                TOP_PARTICIPANT_AVATARS);

        boolean userHasBid = false;
        BigDecimal userCurrentBid = null;

        if (viewerId.isPresent()) {
            List<AuctionBid> userBids = auctionBidRepository
                    .findByAuctionIdAndBidderIdOrderByPlacedAtDesc(auctionId, viewerId.get());
            userHasBid = !userBids.isEmpty();
            if (userHasBid) {
                userCurrentBid = userBids.stream()
                        .map(AuctionBid::getAmount)
                        .max(BigDecimal::compareTo)
                        .orElse(null);
            }
        }

        return new AuctionPublicResponse(
                auction.getId(),
                auction.getListing().getId(),
                auction.getStatus(),
                auction.getStartedAt(),
                auction.getEndsAt(),
                highest.map(AuctionBid::getAmount).orElse(null),
                auctionBidRepository.countDistinctBidderIdByAuctionId(auctionId),
                latestBidders,
                hasEnded,
                userHasBid,
                userCurrentBid);
    }

    private AuctionSellerResponse toSellerResponse(Auction auction) {
        UUID auctionId = auction.getId();
        boolean hasEnded = auction.getStatus() == AuctionStatus.CLOSED
                || auction.getEndsAt().isBefore(OffsetDateTime.now());

        Optional<AuctionBid> highest = auctionBidRepository
                .findTopByAuctionIdOrderByAmountDescPlacedAtAsc(auctionId);

        List<AuctionBidDetail> bids = auctionBidRepository
                .findAllByAuctionIdOrderByAmountDescPlacedAtAsc(auctionId)
                .stream()
                .map(bid -> new AuctionBidDetail(
                        bid.getId(),
                        bid.getBidder().getUsername(),
                        resolveAvatarUrl(bid.getBidder().getAvatarUrl()),
                        bid.getAmount(),
                        bid.getPlacedAt(),
                        bid.isWinning()))
                .toList();

        return new AuctionSellerResponse(
                auction.getId(),
                auction.getListing().getId(),
                auction.getStatus(),
                auction.getStartedAt(),
                auction.getEndsAt(),
                highest.map(AuctionBid::getAmount).orElse(null),
                auctionBidRepository.countDistinctBidderIdByAuctionId(auctionId),
                bids,
                hasEnded);
    }

    private List<AuctionBidderPreview> resolveTopBiddersByHighestBid(
            UUID auctionId,
            int limit) {

        List<AuctionBid> allBids = auctionBidRepository
                .findAllByAuctionIdOrderByAmountDescPlacedAtAsc(auctionId);

        Map<UUID, AuctionBid> highestPerBidder = new LinkedHashMap<>();
        for (AuctionBid bid : allBids) {
            highestPerBidder.putIfAbsent(bid.getBidder().getId(), bid);
        }

        return highestPerBidder.values().stream()
                .sorted(Comparator
                        .comparing(AuctionBid::getAmount)
                        .reversed()
                        .thenComparing(AuctionBid::getPlacedAt))
                .limit(limit)
                .map(bid -> new AuctionBidderPreview(
                        bid.getBidder().getId(),
                        resolveAvatarUrl(bid.getBidder().getAvatarUrl()),
                        resolveInitial(bid.getBidder())))
                .toList();
    }

    private String resolveAvatarUrl(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return null;
        }
        if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
            return storagePath;
        }
        return storageService.getPublicUrl(PROFILE_BUCKET, storagePath);
    }

    private String resolveInitial(User user) {
        if (user.getFirstName() != null && !user.getFirstName().isBlank()) {
            return user.getFirstName().substring(0, 1).toUpperCase();
        }
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            return user.getEmail().substring(0, 1).toUpperCase();
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername().substring(0, 1).toUpperCase();
        }
        return "U";
    }
}
