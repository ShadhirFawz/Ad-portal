package com.marketplace.marketplace.listing.service;

import com.marketplace.marketplace.listing.dto.request.CreateListingRequest;
import com.marketplace.marketplace.listing.dto.request.UpdateListingRequest;
import com.marketplace.marketplace.listing.dto.response.ListingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ListingService {

        ListingResponse create(
                        CreateListingRequest request);

        ListingResponse getById(
                        UUID id);

        ListingResponse getBySlug(
                        String slug);

        ListingResponse getByIdOrSlug(
                        String idOrSlug);

        ListingResponse update(
                        UUID id,
                        UpdateListingRequest request);

        void delete(
                        UUID id);

        ListingResponse publish(
                        UUID id);

        Page<ListingResponse> getMyListings(
                        Pageable pageable);

        Page<ListingResponse> getActiveListings(
                        Pageable pageable);

        Page<ListingResponse> getByCategory(
                        UUID categoryId,
                        Pageable pageable);

        Page<ListingResponse> getByCategory(
                        String categoryIdOrSlug,
                        Pageable pageable);

        Page<ListingResponse> getSimilarListings(
                        String categoryIdOrSlug,
                        String excludeId,
                        Pageable pageable);
}