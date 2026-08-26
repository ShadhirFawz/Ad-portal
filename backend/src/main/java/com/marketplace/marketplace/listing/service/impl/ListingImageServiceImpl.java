package com.marketplace.marketplace.listing.service.impl;

import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.common.storage.SupabaseStorageService;
import com.marketplace.marketplace.listing.config.ListingImageProperties;
import com.marketplace.marketplace.listing.dto.request.RegisterListingImageRequest;
import com.marketplace.marketplace.listing.dto.response.ListingImageResponse;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.entity.ListingImage;
import com.marketplace.marketplace.listing.mapper.ListingImageMapper;
import com.marketplace.marketplace.listing.repository.ListingImageRepository;
import com.marketplace.marketplace.listing.repository.ListingRepository;
import com.marketplace.marketplace.listing.service.ListingImageService;
import com.marketplace.marketplace.listing.util.ListingImageMimeTypes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ListingImageServiceImpl
                implements ListingImageService {

        private final ListingRepository listingRepository;
        private final ListingImageRepository imageRepository;
        private final ListingImageProperties properties;
        private final SupabaseStorageService storageService;
        private final ListingImageMapper imageMapper;

        @Override
        public ListingImageResponse registerImage(
                        UUID listingId,
                        RegisterListingImageRequest request) {

                Listing listing = getOwnedListing(listingId);

                validateListingCanReceiveImages(listing);

                validateRequest(request, listingId);

                long existingCount = imageRepository.countByListingId(
                                listingId);

                if (existingCount >= properties.getMaxImages()) {

                        throw new ConflictException(
                                        "Maximum number of images reached.");
                }

                boolean firstImage = existingCount == 0;

                boolean isExternalUrl = request.storagePath().startsWith("http://")
                                || request.storagePath().startsWith("https://");

                String mimeType = request.mimeType() != null && !request.mimeType().isBlank()
                                ? request.mimeType()
                                : "image/jpeg";

                String fileName = request.fileName() != null && !request.fileName().isBlank()
                                ? request.fileName()
                                : (isExternalUrl ? "external-image" : request.storagePath());

                Long fileSize = request.fileSize() != null ? request.fileSize() : 0L;

                ListingImage image = new ListingImage();

                image.setListing(listing);

                image.setStoragePath(
                                request.storagePath().trim());

                image.setFileName(
                                fileName);

                image.setMimeType(
                                mimeType);

                image.setFileSize(
                                fileSize);

                image.setWidth(
                                request.width());

                image.setHeight(
                                request.height());

                image.setDisplayOrder(
                                (int) existingCount);

                image.setPrimary(
                                firstImage);

                image.setMetadata(
                                request.metadata() != null
                                                ? request.metadata()
                                                : new HashMap<>());

                return imageMapper.toResponse(
                                imageRepository.save(image));
        }

        @Override
        @Transactional(readOnly = true)
        public List<ListingImageResponse> getImages(
                        UUID listingId) {

                return imageRepository
                                .findAllByListingIdOrderByDisplayOrderAsc(
                                                listingId)
                                .stream()
                                .map(imageMapper::toResponse)
                                .toList();
        }

        @Override
        public void deleteImage(
                        UUID listingId,
                        UUID imageId) {

                getOwnedListing(listingId);

                ListingImage image = imageRepository
                                .findByIdAndListingId(
                                                imageId,
                                                listingId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Listing image not found."));

                boolean wasPrimary = image.isPrimary();

                String storagePath = image.getStoragePath();

                /*
                 * Delete physical file only if stored in Supabase storage (not external URL).
                 */
                if (storagePath != null
                                && !storagePath.startsWith("http://")
                                && !storagePath.startsWith("https://")) {
                        try {
                                storageService.delete(
                                                properties.getBucket(),
                                                storagePath);
                        } catch (Exception ignored) {
                                // Ignore cleanup failure
                        }
                }

                /*
                 * Remove database record.
                 */
                imageRepository.delete(image);

                if (wasPrimary) {

                        imageRepository
                                        .findAllByListingIdOrderByDisplayOrderAsc(
                                                        listingId)
                                        .stream()
                                        .findFirst()
                                        .ifPresent(next -> {

                                                next.setPrimary(true);

                                                imageRepository.save(next);
                                        });
                }
        }

        @Override
        public void setPrimary(
                        UUID listingId,
                        UUID imageId) {

                getOwnedListing(listingId);

                ListingImage image = imageRepository
                                .findByIdAndListingId(
                                                imageId,
                                                listingId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Listing image not found."));

                imageRepository
                                .findByListingIdAndPrimaryTrue(
                                                listingId)
                                .ifPresent(current -> {

                                        if (!current.getId()
                                                        .equals(imageId)) {

                                                current.setPrimary(false);
                                                imageRepository.save(current);
                                        }
                                });

                image.setPrimary(true);

                imageRepository.save(image);
        }

        @Transactional(readOnly = true)
        public ListingImageResponse getPrimaryImage(
                        UUID listingId) {

                return imageRepository
                                .findByListingIdAndPrimaryTrue(
                                                listingId)
                                .map(imageMapper::toResponse)
                                .orElse(null);
        }

        @Override
        public void reorderImages(
                        UUID listingId,
                        List<UUID> imageIds) {

                getOwnedListing(listingId);

                List<ListingImage> images = imageRepository
                                .findAllByListingIdOrderByDisplayOrderAsc(
                                                listingId);

                if (images.size() != imageIds.size()) {

                        throw new ConflictException(
                                        "Image list does not match the listing images.");
                }

                var existingIds = images.stream()
                                .map(ListingImage::getId)
                                .collect(
                                                java.util.stream.Collectors.toSet());

                var requestedIds = new java.util.HashSet<>(imageIds);

                if (existingIds.size() != requestedIds.size()
                                || !existingIds.equals(requestedIds)) {

                        throw new ConflictException(
                                        "Invalid image ordering.");
                }

                var imageById = images.stream()
                                .collect(
                                                java.util.stream.Collectors.toMap(
                                                                ListingImage::getId,
                                                                image -> image));

                for (int index = 0; index < imageIds.size(); index++) {

                        UUID imageId = imageIds.get(index);

                        ListingImage image = imageById.get(imageId);

                        image.setDisplayOrder(index);
                }

                imageRepository.saveAll(images);
        }

        private Listing getOwnedListing(
                        UUID listingId) {

                UUID currentUserId = SecurityUtils.getCurrentUserId();

                return listingRepository
                                .findByIdAndSellerId(
                                                listingId,
                                                currentUserId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Listing not found."));
        }

        private void validateListingCanReceiveImages(
                        Listing listing) {

                switch (listing.getStatus()) {

                        case DRAFT, ACTIVE, RESERVED -> {
                                // allowed
                        }

                        default ->
                                throw new ConflictException(
                                                "Images cannot be modified for this listing.");
                }
        }

        private void validateRequest(
                        RegisterListingImageRequest request,
                        UUID listingId) {

                String path = request.storagePath().trim();
                boolean isExternalUrl = path.startsWith("http://") || path.startsWith("https://");

                if (isExternalUrl) {
                        try {
                                java.net.URI uri = java.net.URI.create(path);
                                if (uri.getHost() == null || uri.getHost().isBlank()) {
                                        throw new ConflictException("Invalid image URL host.");
                                }
                        } catch (Exception e) {
                                throw new ConflictException("Invalid image URL format.");
                        }

                        if (request.mimeType() != null && !request.mimeType().isBlank()) {
                                if (!ListingImageMimeTypes.isAllowed(request.mimeType())
                                                && !request.mimeType().startsWith("image/")) {
                                        throw new ConflictException("Unsupported image type.");
                                }
                        }

                        if (request.fileSize() != null && request.fileSize() > properties.getMaxFileSize()) {
                                throw new ConflictException("Image exceeds the maximum allowed size.");
                        }
                } else {
                        if (request.mimeType() == null
                                        || !ListingImageMimeTypes.isAllowed(request.mimeType())) {

                                throw new ConflictException("Unsupported image type.");
                        }

                        if (request.fileSize() != null && request.fileSize() > properties.getMaxFileSize()) {

                                throw new ConflictException("Image exceeds the maximum allowed size.");
                        }

                        String expectedPrefix = "listings/"
                                        + listingId
                                        + "/";

                        if (!path.startsWith(expectedPrefix)) {

                                throw new ConflictException("Invalid image storage path.");
                        }

                        if (path.contains("..")) {

                                throw new ConflictException("Invalid image storage path.");
                        }
                }
        }
}