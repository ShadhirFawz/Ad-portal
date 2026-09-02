package com.marketplace.marketplace.auction.controller;

import com.marketplace.marketplace.auction.dto.request.PlaceBidRequest;
import com.marketplace.marketplace.auction.dto.request.StartAuctionRequest;
import com.marketplace.marketplace.auction.dto.response.AuctionPublicResponse;
import com.marketplace.marketplace.auction.dto.response.AuctionSellerResponse;
import com.marketplace.marketplace.auction.dto.response.PlaceBidResponse;
import com.marketplace.marketplace.auction.service.AuctionService;
import com.marketplace.marketplace.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/listings/{listingId}/auction")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    @PostMapping("/start")
    public ApiResponse<AuctionPublicResponse> startAuction(
            @PathVariable UUID listingId,
            @RequestBody(required = false) StartAuctionRequest request) {

        return ApiResponse.success(
                "Auction started successfully.",
                auctionService.startAuction(listingId));
    }

    @GetMapping
    public ApiResponse<AuctionPublicResponse> getAuction(
            @PathVariable UUID listingId) {

        AuctionPublicResponse auction = auctionService.getAuctionForListing(listingId);

        if (auction == null) {
            return ApiResponse.success("No auction found for this listing.", null);
        }

        return ApiResponse.success(
                "Auction retrieved successfully.",
                auction);
    }

    @GetMapping("/seller")
    public ApiResponse<AuctionSellerResponse> getSellerAuction(
            @PathVariable UUID listingId) {

        return ApiResponse.success(
                "Auction seller view retrieved successfully.",
                auctionService.getAuctionSellerView(listingId));
    }

    @PostMapping("/bid")
    public ApiResponse<PlaceBidResponse> placeBid(
            @PathVariable UUID listingId,
            @Valid @RequestBody PlaceBidRequest request) {

        return ApiResponse.success(
                "Bid placed successfully.",
                auctionService.placeBid(listingId, request));
    }
}
