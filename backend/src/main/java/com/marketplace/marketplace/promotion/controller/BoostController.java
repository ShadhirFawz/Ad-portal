package com.marketplace.marketplace.promotion.controller;

import com.marketplace.marketplace.common.response.ApiResponse;
import com.marketplace.marketplace.promotion.dto.request.BoostCheckoutRequest;
import com.marketplace.marketplace.promotion.dto.request.BoostIpnRequest;
import com.marketplace.marketplace.promotion.dto.response.AdBoostResponse;
import com.marketplace.marketplace.promotion.dto.response.BoostCheckoutResponse;
import com.marketplace.marketplace.promotion.dto.response.BoostPlanResponse;
import com.marketplace.marketplace.promotion.service.BoostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/boosts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Promotion & Ad Boosts", description = "Endpoints for listing promotions, boost packages, and PayHere checkout")
public class BoostController {

    private final BoostService boostService;

    @GetMapping("/plans")
    @Operation(summary = "Get all available boost plans and pricing tiers")
    public ResponseEntity<ApiResponse<List<BoostPlanResponse>>> getBoostPlans() {
        List<BoostPlanResponse> plans = boostService.getBoostPlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @PostMapping("/checkout")
    @Operation(summary = "Create an ad boost checkout session and generate PayHere parameters")
    public ResponseEntity<ApiResponse<BoostCheckoutResponse>> createCheckout(
            @Valid @RequestBody BoostCheckoutRequest request
    ) {
        BoostCheckoutResponse response = boostService.createCheckout(request);
        return ResponseEntity.ok(ApiResponse.success("Checkout session created successfully", response));
    }

    @PostMapping(value = "/notify", consumes = {MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    @Operation(summary = "PayHere server-to-server IPN webhook notification (form-urlencoded)")
    public ResponseEntity<String> handlePayHereIpnForm(
            @RequestParam Map<String, String> allParams
    ) {
        log.info("PayHere IPN form-urlencoded callback received: {}", allParams);
        BoostIpnRequest ipn = new BoostIpnRequest(
                allParams.get("merchant_id"),
                allParams.get("order_id"),
                allParams.get("payment_id"),
                allParams.get("payhere_amount"),
                allParams.get("payhere_currency"),
                allParams.get("status_code"),
                allParams.get("md5sig"),
                allParams.get("custom_1"),
                allParams.get("custom_2"),
                allParams.get("method"),
                allParams.get("status_message"),
                allParams.get("card_holder_name"),
                allParams.get("card_no"),
                allParams.get("card_expiry")
        );
        boostService.processPayHereIpn(ipn);
        return ResponseEntity.ok("OK");
    }

    @PostMapping(value = "/notify", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "PayHere IPN webhook notification (json fallback)")
    public ResponseEntity<String> handlePayHereIpnJson(
            @RequestBody BoostIpnRequest ipn
    ) {
        log.info("PayHere IPN JSON callback received: {}", ipn);
        boostService.processPayHereIpn(ipn);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/my")
    @Operation(summary = "Get the current authenticated user's boost history and active boosts")
    public ResponseEntity<ApiResponse<List<AdBoostResponse>>> getMyBoosts() {
        List<AdBoostResponse> boosts = boostService.getMyBoosts();
        return ResponseEntity.ok(ApiResponse.success(boosts));
    }

    @GetMapping("/listing/{listingId}")
    @Operation(summary = "Get currently active boosts for a specific listing")
    public ResponseEntity<ApiResponse<List<AdBoostResponse>>> getActiveBoostsForListing(
            @PathVariable UUID listingId
    ) {
        List<AdBoostResponse> boosts = boostService.getActiveBoostsForListing(listingId);
        return ResponseEntity.ok(ApiResponse.success(boosts));
    }

    @PostMapping("/confirm-payment")
    @Operation(summary = "Confirm and activate payment upon return from PayHere checkout")
    public ResponseEntity<ApiResponse<AdBoostResponse>> confirmPayment(
            @RequestParam String orderId,
            @RequestParam(required = false) String paymentId
    ) {
        AdBoostResponse boost = boostService.confirmPayment(orderId, paymentId);
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed and boost activated", boost));
    }

    @PostMapping("/{boostId}/cancel")
    @Operation(summary = "Cancel a scheduled boost before it becomes active")
    public ResponseEntity<ApiResponse<Void>> cancelScheduledBoost(
            @PathVariable UUID boostId
    ) {
        boostService.cancelScheduledBoost(boostId);
        return ResponseEntity.ok(ApiResponse.success("Scheduled boost cancelled successfully", null));
    }
}
