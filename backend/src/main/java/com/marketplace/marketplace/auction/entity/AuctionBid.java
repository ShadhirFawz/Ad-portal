package com.marketplace.marketplace.auction.entity;

import com.marketplace.marketplace.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "auction_bids", indexes = {
        @Index(name = "idx_auction_bids_auction_id", columnList = "auction_id"),
        @Index(name = "idx_auction_bids_bidder_id", columnList = "bidder_id")
})
@Getter
@Setter
@NoArgsConstructor
public class AuctionBid {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bidder_id", nullable = false)
    private User bidder;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "placed_at", nullable = false)
    private OffsetDateTime placedAt;

    @Column(name = "is_winning", nullable = false)
    private boolean winning = false;

    @PrePersist
    protected void onCreate() {
        if (placedAt == null) {
            placedAt = OffsetDateTime.now();
        }
    }
}
