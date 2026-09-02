package com.marketplace.marketplace.auction.repository;

import com.marketplace.marketplace.auction.entity.Auction;
import com.marketplace.marketplace.auction.enums.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuctionRepository extends JpaRepository<Auction, UUID> {

    Optional<Auction> findByListingIdAndStatus(UUID listingId, AuctionStatus status);

    Optional<Auction> findTopByListingIdOrderByCreatedAtDesc(UUID listingId);

    Optional<Auction> findByIdAndSellerId(UUID id, UUID sellerId);
}
