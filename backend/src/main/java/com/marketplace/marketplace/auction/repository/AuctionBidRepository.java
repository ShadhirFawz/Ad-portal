package com.marketplace.marketplace.auction.repository;

import com.marketplace.marketplace.auction.entity.AuctionBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuctionBidRepository extends JpaRepository<AuctionBid, UUID> {

    Optional<AuctionBid> findTopByAuctionIdOrderByAmountDescPlacedAtAsc(UUID auctionId);

    @Query("SELECT COUNT(DISTINCT b.bidder.id) FROM AuctionBid b WHERE b.auction.id = :auctionId")
    long countDistinctBidderIdByAuctionId(@Param("auctionId") UUID auctionId);

    List<AuctionBid> findAllByAuctionIdOrderByAmountDescPlacedAtAsc(UUID auctionId);

    boolean existsByAuctionIdAndBidderId(UUID auctionId, UUID bidderId);

    List<AuctionBid> findByAuctionIdAndBidderIdOrderByPlacedAtDesc(UUID auctionId, UUID bidderId);

    @Modifying
    @Query("UPDATE AuctionBid b SET b.winning = false WHERE b.auction.id = :auctionId")
    void clearWinningFlags(@Param("auctionId") UUID auctionId);
}
