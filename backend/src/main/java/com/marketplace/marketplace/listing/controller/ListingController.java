package com.marketplace.marketplace.listing.controller;

import com.marketplace.marketplace.common.response.ApiResponse;
import com.marketplace.marketplace.listing.dto.request.CreateListingRequest;
import com.marketplace.marketplace.listing.dto.request.UpdateListingRequest;
import com.marketplace.marketplace.listing.dto.response.ListingResponse;
import com.marketplace.marketplace.listing.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @PostMapping
    public ApiResponse<ListingResponse> create(
            @Valid @RequestBody CreateListingRequest request) {

        return ApiResponse.success(
                "Listing created successfully.",
                listingService.create(request));
    }

    @GetMapping("/mine")
    public ApiResponse<Page<ListingResponse>> getMyListings(
            Pageable pageable) {

        return ApiResponse.success(
                "Listings retrieved successfully.",
                listingService.getMyListings(pageable));
    }

    @GetMapping
    public ApiResponse<Page<ListingResponse>> getActiveListings(
            Pageable pageable) {

        return ApiResponse.success(
                "Listings retrieved successfully.",
                listingService.getActiveListings(pageable));
    }

    @GetMapping("/category/{categoryIdOrSlug}")
    public ApiResponse<Page<ListingResponse>> getByCategory(
            @PathVariable String categoryIdOrSlug,
            Pageable pageable) {

        return ApiResponse.success(
                "Listings retrieved successfully.",
                listingService.getByCategory(
                        categoryIdOrSlug,
                        pageable));
    }

    @GetMapping("/slug/{slug}")
    public ApiResponse<ListingResponse> getBySlug(
            @PathVariable String slug) {

        return ApiResponse.success(
                "Listing retrieved successfully.",
                listingService.getBySlug(slug));
    }

    @GetMapping("/{idOrSlug}")
    public ApiResponse<ListingResponse> getByIdOrSlug(
            @PathVariable String idOrSlug) {

        return ApiResponse.success(
                "Listing retrieved successfully.",
                listingService.getByIdOrSlug(idOrSlug));
    }

    @PatchMapping("/{id}")
    public ApiResponse<ListingResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateListingRequest request) {

        return ApiResponse.success(
                "Listing updated successfully.",
                listingService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable UUID id) {

        listingService.delete(id);

        return ApiResponse.success(
                "Listing deleted successfully.",
                null);
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<ListingResponse> publish(
            @PathVariable UUID id) {

        return ApiResponse.success(
                "Listing published successfully.",
                listingService.publish(id));
    }
}