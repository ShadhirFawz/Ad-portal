package com.marketplace.marketplace.membership.controller;

import com.marketplace.marketplace.common.response.ApiResponse;
import com.marketplace.marketplace.membership.dto.InitiateMembershipRequest;
import com.marketplace.marketplace.membership.dto.InitiateMembershipResponse;
import com.marketplace.marketplace.membership.dto.MembershipPricingPlanResponse;
import com.marketplace.marketplace.membership.dto.SellerMembershipResponse;
import com.marketplace.marketplace.membership.service.MembershipService;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/membership")
@RequiredArgsConstructor
@Slf4j
public class MembershipController {

    private final MembershipService membershipService;
    private final UserRepository userRepository;

    private User resolveUser() {
        java.util.UUID userId = SecurityUtils.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new com.marketplace.marketplace.common.exception.ResourceNotFoundException("User not found"));
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<MembershipPricingPlanResponse>>> getPlans(
            @RequestParam(name = "rootCategoryId", required = false) UUID rootCategoryId
    ) {
        List<MembershipPricingPlanResponse> plans = (rootCategoryId != null)
                ? membershipService.getPlansForCategory(rootCategoryId)
                : membershipService.getAllActivePlans();

        return ResponseEntity.ok(ApiResponse.success("Membership plans retrieved successfully", plans));
    }

    @GetMapping("/my-membership")
    public ResponseEntity<ApiResponse<SellerMembershipResponse>> getMyActiveMembership() {
        User user = resolveUser();
        SellerMembershipResponse response = membershipService.getMyActiveMembership(user.getId()).orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Active seller membership retrieved successfully", response));
    }

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<InitiateMembershipResponse>> initiateMembership(
            @Valid @RequestBody InitiateMembershipRequest request
    ) {
        User user = resolveUser();
        InitiateMembershipResponse response = membershipService.initiateMembership(user, request);
        return ResponseEntity.ok(ApiResponse.success("Membership checkout initiated successfully", response));
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<ApiResponse<SellerMembershipResponse>> confirmPayment(
            @RequestParam String orderId,
            @RequestParam(required = false) String paymentId
    ) {
        SellerMembershipResponse response = membershipService.confirmPaymentByOrderId(orderId, paymentId);
        return ResponseEntity.ok(ApiResponse.success("Membership confirmed and activated successfully", response));
    }

    @PostMapping("/confirm-sandbox")
    public ResponseEntity<ApiResponse<SellerMembershipResponse>> confirmSandbox(
            @RequestBody Map<String, String> body
    ) {
        String membershipIdStr = body.get("membershipId");
        if (membershipIdStr == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("membershipId is required"));
        }
        UUID membershipId = UUID.fromString(membershipIdStr);
        SellerMembershipResponse response = membershipService.confirmMembershipPayment(membershipId, "SANDBOX-CONFIRMED-" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.ok(ApiResponse.success("Membership successfully activated in sandbox mode", response));
    }

    @PostMapping(value = "/payhere-notify", consumes = {MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<String> payHereNotifyForm(@RequestParam Map<String, String> allParams) {
        log.info("Received PayHere form notification for membership: {}", allParams);
        membershipService.handlePayHereNotification(allParams);
        return ResponseEntity.ok("OK");
    }

    @PostMapping(value = "/payhere-notify", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> payHereNotifyJson(@RequestBody Map<String, String> allParams) {
        log.info("Received PayHere JSON notification for membership: {}", allParams);
        membershipService.handlePayHereNotification(allParams);
        return ResponseEntity.ok("OK");
    }
}
