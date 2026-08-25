package com.marketplace.marketplace.listing.repository;

import com.marketplace.marketplace.listing.entity.ListingImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListingImageRepository
        extends JpaRepository<ListingImage, UUID> {

    List<ListingImage> findAllByListingIdOrderByDisplayOrderAsc(
            UUID listingId);

    Optional<ListingImage> findByIdAndListingId(
            UUID id,
            UUID listingId);

    Optional<ListingImage> findByListingIdAndPrimaryTrue(
            UUID listingId);

    long countByListingId(UUID listingId);

    @Query("""
        SELECT i
        FROM ListingImage i
        WHERE i.listing.id IN :listingIds
          AND i.primary = true
    """)
    List<ListingImage> findPrimaryImages(
            @Param("listingIds")
            Collection<UUID> listingIds
    );
}