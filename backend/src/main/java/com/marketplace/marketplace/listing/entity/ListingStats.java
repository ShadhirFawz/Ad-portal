package com.marketplace.marketplace.listing.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "listing_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ListingStats {

    @Id
    @Column(name = "listing_id", nullable = false)
    private UUID listingId;

    @Column(name = "view_count", nullable = false)
    private long viewCount = 0;
}
