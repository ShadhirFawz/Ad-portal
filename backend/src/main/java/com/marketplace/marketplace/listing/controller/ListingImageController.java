package com.marketplace.marketplace.listing.controller;

import com.marketplace.marketplace.listing.dto.response.ListingImageResponse;
import com.marketplace.marketplace.listing.dto.request.RegisterListingImageRequest;
import com.marketplace.marketplace.listing.dto.request.ReorderListingImagesRequest;
import com.marketplace.marketplace.listing.service.ListingImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings/{listingId}/images")
@RequiredArgsConstructor
public class ListingImageController {

    private final ListingImageService imageService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ListingImageResponse registerImage(
            @PathVariable UUID listingId,
            @Valid @RequestBody RegisterListingImageRequest request) {

        return imageService.registerImage(
                listingId,
                request);
    }

    @GetMapping
    public List<ListingImageResponse> getImages(
            @PathVariable UUID listingId) {

        return imageService.getImages(
                listingId);
    }

    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImage(
            @PathVariable UUID listingId,
            @PathVariable UUID imageId) {

        imageService.deleteImage(
                listingId,
                imageId);
    }

    @PostMapping("/{imageId}/primary")
    public ListingImageResponse setPrimary(
            @PathVariable UUID listingId,
            @PathVariable UUID imageId) {

        imageService.setPrimary(
                listingId,
                imageId);

        return imageService
                .getImages(listingId)
                .stream()
                .filter(ListingImageResponse::primary)
                .findFirst()
                .orElseThrow();
    }

    @PutMapping("/order")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reorderImages(
            @PathVariable UUID listingId,
            @Valid @RequestBody ReorderListingImagesRequest request) {

        imageService.reorderImages(
                listingId,
                request.imageIds());
    }
}