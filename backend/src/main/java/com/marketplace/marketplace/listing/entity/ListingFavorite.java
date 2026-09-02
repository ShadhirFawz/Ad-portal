package com.marketplace.marketplace.listing.entity;

import com.marketplace.marketplace.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "listing_favorites", indexes = {
        @Index(name = "idx_listing_favorites_user_id", columnList = "user_id"),
        @Index(name = "idx_listing_favorites_listing_id", columnList = "listing_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_listing_favorites_user_listing", columnNames = {"user_id", "listing_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class ListingFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    public ListingFavorite(User user, Listing listing) {
        this.user = user;
        this.listing = listing;
    }
}
