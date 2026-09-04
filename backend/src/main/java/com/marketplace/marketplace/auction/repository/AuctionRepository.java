package com.marketplace.marketplace.auction.repository;

import com.marketplace.marketplace.auction.entity.Auction;
import com.marketplace.marketplace.auction.enums.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface AuctionRepository extends JpaRepository<Auction, UUID> {

    Optional<Auction> findByListingId(UUID listingId);

    Optional<Auction> findByListingIdAndStatus(UUID listingId, AuctionStatus status);

    Optional<Auction> findTopByListingIdOrderByCreatedAtDesc(UUID listingId);

    Optional<Auction> findByIdAndSellerId(UUID id, UUID sellerId);

    boolean existsByListingId(UUID listingId);

    boolean existsBySellerIdAndStatus(UUID sellerId, AuctionStatus status);

    /** Returns the IDs of listings that currently have an ACTIVE auction among the given set. */
    @Query("SELECT a.listing.id FROM Auction a WHERE a.listing.id IN :listingIds AND a.status = 'ACTIVE' AND a.endsAt > :now")
    Set<UUID> findActiveAuctionListingIds(@Param("listingIds") Collection<UUID> listingIds,
                                          @Param("now") OffsetDateTime now);

    @Modifying
    @Query("UPDATE Auction a SET a.status = 'CLOSED' WHERE a.seller.id = :sellerId AND a.status = 'ACTIVE' AND a.endsAt <= :now")
    int closeExpiredAuctionsForSeller(@Param("sellerId") UUID sellerId, @Param("now") OffsetDateTime now);

    @Modifying
    @Query("UPDATE Auction a SET a.status = 'CLOSED' WHERE a.status = 'ACTIVE' AND a.endsAt <= :now")
    int closeAllExpiredAuctions(@Param("now") OffsetDateTime now);
}
