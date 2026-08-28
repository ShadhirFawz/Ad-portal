package com.marketplace.marketplace.listing.repository;

import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ListingRepository
                extends JpaRepository<Listing, UUID> {

        Page<Listing> findAllBySellerId(
                        UUID sellerId,
                        Pageable pageable);

        Page<Listing> findAllByStatus(
                        ListingStatus status,
                        Pageable pageable);

        Page<Listing> findAllByCategoryIdAndStatus(
                        UUID categoryId,
                        ListingStatus status,
                        Pageable pageable);

        Page<Listing> findAllByCategoryIdInAndStatus(
                        java.util.Collection<UUID> categoryIds,
                        ListingStatus status,
                        Pageable pageable);

        Optional<Listing> findByIdAndSellerId(
                        UUID id,
                        UUID sellerId);

        Optional<Listing> findBySlug(
                        String slug);

        boolean existsBySlug(
                        String slug);
}