package com.marketplace.marketplace.promotion.service.impl;

import com.marketplace.marketplace.common.exception.ConflictException;
import com.marketplace.marketplace.common.exception.ResourceNotFoundException;
import com.marketplace.marketplace.common.security.util.SecurityUtils;
import com.marketplace.marketplace.listing.entity.Listing;
import com.marketplace.marketplace.listing.enums.ListingStatus;
import com.marketplace.marketplace.listing.repository.ListingRepository;
import com.marketplace.marketplace.promotion.config.BoostPricingProperties;
import com.marketplace.marketplace.promotion.config.PayHereProperties;
import com.marketplace.marketplace.promotion.dto.request.BoostCheckoutRequest;
import com.marketplace.marketplace.promotion.dto.request.BoostIpnRequest;
import com.marketplace.marketplace.promotion.dto.response.AdBoostResponse;
import com.marketplace.marketplace.promotion.dto.response.BoostCheckoutResponse;
import com.marketplace.marketplace.promotion.dto.response.BoostPlanResponse;
import com.marketplace.marketplace.promotion.dto.response.BoostPricingTierResponse;
import com.marketplace.marketplace.promotion.entity.AdBoost;
import com.marketplace.marketplace.promotion.entity.BoostPayment;
import com.marketplace.marketplace.promotion.entity.BoostPricingPlan;
import com.marketplace.marketplace.promotion.enums.BoostDuration;
import com.marketplace.marketplace.promotion.enums.BoostStatus;
import com.marketplace.marketplace.promotion.enums.BoostType;
import com.marketplace.marketplace.promotion.enums.PaymentStatus;
import com.marketplace.marketplace.promotion.repository.AdBoostRepository;
import com.marketplace.marketplace.promotion.repository.BoostPaymentRepository;
import com.marketplace.marketplace.promotion.repository.BoostPricingPlanRepository;
import com.marketplace.marketplace.promotion.service.BoostService;
import com.marketplace.marketplace.promotion.util.PayHereHashUtil;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoostServiceImpl implements BoostService {

    private final AdBoostRepository adBoostRepository;
    private final BoostPaymentRepository boostPaymentRepository;
    private final BoostPricingPlanRepository boostPricingPlanRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final PayHereProperties payHereProperties;
    private final BoostPricingProperties boostPricingProperties;

    @Override
    @Transactional(readOnly = true)
    public List<BoostPlanResponse> getBoostPlans() {
        List<BoostPricingPlan> dbPlans = boostPricingPlanRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

        // Group tiers by BoostType
        Map<BoostType, List<BoostPricingTierResponse>> tiersByType = new EnumMap<>(BoostType.class);
        Map<BoostType, Map<BoostDuration, BigDecimal>> pricingByType = new EnumMap<>(BoostType.class);

        for (BoostPricingPlan p : dbPlans) {
            BoostPricingTierResponse tier = new BoostPricingTierResponse(
                    p.getId(),
                    p.getDuration(),
                    p.getDurationDays(),
                    p.getBasePrice(),
                    p.getDiscountPercentage(),
                    p.getDiscountAmount(),
                    p.getPriceAfterDiscount(),
                    p.getTaxPercentage(),
                    p.getTaxAmount(),
                    p.getFinalPrice(),
                    p.isActive());
            tiersByType.computeIfAbsent(p.getBoostType(), k -> new ArrayList<>()).add(tier);
            pricingByType.computeIfAbsent(p.getBoostType(), k -> new EnumMap<>(BoostDuration.class))
                    .put(p.getDuration(), p.getFinalPrice());
        }

        return List.of(
                new BoostPlanResponse(
                        BoostType.SPOTLIGHT,
                        "Spotlight Ad",
                        "SPOTLIGHT",
                        "Reserve a top showcase position on search results and category pages with a radiant golden spotlight border.",
                        List.of(
                                "Top 2 priority showcase placement",
                                "Eye-catching glowing gold badge & frame",
                                "Up to 5x more clicks & engagement",
                                "Equal round-robin rotation among top slots"),
                        "amber",
                        pricingByType.getOrDefault(BoostType.SPOTLIGHT,
                                boostPricingProperties.getPricing().get(BoostType.SPOTLIGHT)),
                        tiersByType.getOrDefault(BoostType.SPOTLIGHT, Collections.emptyList())),
                new BoostPlanResponse(
                        BoostType.PUSH_UP,
                        "Push Up",
                        "PUSH UP",
                        "Instantly bump your listing to the very top of recent listings every 24 hours throughout your promotion period.",
                        List.of(
                                "Daily automatic bump to top of search results",
                                "Moves down naturally as fresh ads arrive",
                                "Keeps your ad consistently discoverable",
                                "Ideal for fast-moving categories"),
                        "emerald",
                        pricingByType.getOrDefault(BoostType.PUSH_UP,
                                boostPricingProperties.getPricing().get(BoostType.PUSH_UP)),
                        tiersByType.getOrDefault(BoostType.PUSH_UP, Collections.emptyList())),
                new BoostPlanResponse(
                        BoostType.HOT_DEAL,
                        "Hot Deal",
                        "HOT DEAL",
                        "Signal high urgency and great pricing with a vibrant flame badge and inclusion in the exclusive Hot Deals filter.",
                        List.of(
                                "Vibrant red/rose urgency badge",
                                "Featured in the high-intent Hot Deals tab",
                                "Encourages immediate buyer inquiries",
                                "Pairs perfectly with discounts & quick sales"),
                        "rose",
                        pricingByType.getOrDefault(BoostType.HOT_DEAL,
                                boostPricingProperties.getPricing().get(BoostType.HOT_DEAL)),
                        tiersByType.getOrDefault(BoostType.HOT_DEAL, Collections.emptyList())),
                new BoostPlanResponse(
                        BoostType.POWER_PACK,
                        "Power Pack (All-in-One)",
                        "POWER PACK",
                        "Maximum visibility suite combining Spotlight placement, daily Push-Ups, and the Hot Deal badge at a bundled discount.",
                        List.of(
                                "Includes Spotlight + Push Up + Hot Deal",
                                "Exclusive gradient purple badge & frame",
                                "Up to 10x higher buyer engagement",
                                "Best value for high-value items"),
                        "purple",
                        pricingByType.getOrDefault(BoostType.POWER_PACK,
                                boostPricingProperties.getPricing().get(BoostType.POWER_PACK)),
                        tiersByType.getOrDefault(BoostType.POWER_PACK, Collections.emptyList())));
    }

    @Override
    @Transactional
    public BoostCheckoutResponse createCheckout(BoostCheckoutRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        Listing listing = listingRepository.findById(request.listingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found: " + request.listingId()));

        if (!listing.getSeller().getId().equals(currentUserId)) {
            throw new ConflictException("You can only boost listings that you own.");
        }

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new ConflictException("Only active listings can be boosted.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startsAt = request.scheduledStartTime() != null && request.scheduledStartTime().isAfter(now)
                ? request.scheduledStartTime()
                : now;

        OffsetDateTime expiresAt = startsAt.plusDays(request.duration().getDays());

        // Validate conflicts
        if (adBoostRepository.existsActiveOrScheduledBoost(listing.getId(), request.boostType(), now)) {
            throw new ConflictException(
                    "This listing already has an active or scheduled " + request.boostType() + " boost.");
        }

        // Calculate amount dynamically from database
        BigDecimal amount = boostPricingPlanRepository
                .findByBoostTypeAndDurationAndIsActiveTrue(request.boostType(), request.duration())
                .map(BoostPricingPlan::getFinalPrice)
                .orElseGet(() -> boostPricingProperties.getPrice(request.boostType(), request.duration()));

        String currency = payHereProperties.getCurrency() != null ? payHereProperties.getCurrency() : "LKR";

        // Create AdBoost subscription
        AdBoost adBoost = new AdBoost();
        adBoost.setListing(listing);
        adBoost.setUser(user);
        adBoost.setBoostType(request.boostType());
        adBoost.setBoostStatus(BoostStatus.PENDING_PAYMENT);
        adBoost.setDurationDays(request.duration().getDays());
        adBoost.setStartsAt(startsAt);
        adBoost.setExpiresAt(expiresAt);
        adBoost = adBoostRepository.save(adBoost);

        // Generate unique PayHere order ID
        String orderId = "BOOST-" + adBoost.getId().toString().substring(0, 8).toUpperCase() + "-"
                + System.currentTimeMillis();

        // Create BoostPayment
        BoostPayment payment = new BoostPayment();
        payment.setBoostSubscription(adBoost);
        payment.setPayhereOrderId(orderId);
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment = boostPaymentRepository.save(payment);

        // Calculate PayHere MD5 signature
        String formattedAmount = PayHereHashUtil.formatAmount(amount);
        String hash = PayHereHashUtil.generateCheckoutHash(
                payHereProperties.getMerchantId(),
                orderId,
                amount,
                currency,
                payHereProperties.getMerchantSecret());

        log.info("PayHere hash inputs — merchant_id: [{}], order_id: [{}], amount: [{}], currency: [{}]",
                payHereProperties.getMerchantId(), orderId, formattedAmount, currency);

        String boostLabel = request.boostType().name().replace("_", " ");
        String itemsValue = boostLabel + " " + request.duration().getDays() + " Days Ad Boost";

        Map<String, String> payHereParams = new HashMap<>();
        payHereParams.put("merchant_id", payHereProperties.getMerchantId());
        payHereParams.put("return_url", payHereProperties.getReturnUrl() + "?order_id=" + orderId);
        payHereParams.put("cancel_url", payHereProperties.getCancelUrl() + "?order_id=" + orderId);
        payHereParams.put("notify_url", payHereProperties.getNotifyUrl());
        payHereParams.put("order_id", orderId);
        payHereParams.put("items", itemsValue);
        payHereParams.put("currency", currency);
        payHereParams.put("amount", formattedAmount);
        payHereParams.put("first_name", user.getFirstName() != null ? user.getFirstName() : "Customer");
        payHereParams.put("last_name", user.getLastName() != null ? user.getLastName() : "User");
        payHereParams.put("email", user.getEmail());
        payHereParams.put("phone", user.getPhoneNumber() != null ? user.getPhoneNumber() : "0771234567");
        payHereParams.put("address", "Marketplace Platform");
        payHereParams.put("city", "Colombo");
        payHereParams.put("country", "Sri Lanka");
        payHereParams.put("hash", hash);
        payHereParams.put("custom_1", adBoost.getId().toString());
        payHereParams.put("custom_2", listing.getId().toString());

        String checkoutUrl = payHereProperties.getBaseUrl() + "/pay/checkout";

        return new BoostCheckoutResponse(
                adBoost.getId(),
                payment.getId(),
                orderId,
                amount,
                currency,
                checkoutUrl,
                payHereParams);
    }

    @Override
    @Transactional
    public void processPayHereIpn(BoostIpnRequest ipn) {
        log.info("Received PayHere IPN notification for orderId: {}, statusCode: {}", ipn.order_id(),
                ipn.status_code());

        // Verify MD5 Signature
        boolean isValid = PayHereHashUtil.verifyIpnHash(
                ipn.merchant_id(),
                ipn.order_id(),
                ipn.payhere_amount(),
                ipn.payhere_currency(),
                ipn.status_code(),
                ipn.md5sig(),
                payHereProperties.getMerchantSecret());

        if (!isValid) {
            log.warn("Invalid PayHere IPN MD5 signature for orderId: {}", ipn.order_id());
            throw new IllegalArgumentException("Invalid signature");
        }

        BoostPayment payment = boostPaymentRepository.findByPayhereOrderId(ipn.order_id())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for orderId: " + ipn.order_id()));

        Map<String, Object> raw = new HashMap<>();
        raw.put("payment_id", ipn.payment_id());
        raw.put("status_code", ipn.status_code());
        raw.put("status_message", ipn.status_message());
        raw.put("method", ipn.method());
        raw.put("card_holder_name", ipn.card_holder_name());
        raw.put("card_no", ipn.card_no());
        payment.setPayhereRawResponse(raw);
        payment.setPayherePaymentId(ipn.payment_id());

        AdBoost boost = payment.getBoostSubscription();
        OffsetDateTime now = OffsetDateTime.now();

        // Status code 2 indicates successful payment in PayHere
        if ("2".equals(ipn.status_code())) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);

            if (boost.getStartsAt().isAfter(now)) {
                boost.setBoostStatus(BoostStatus.SCHEDULED);
                log.info("Boost {} scheduled for future activation at {}", boost.getId(), boost.getStartsAt());
            } else {
                boost.setBoostStatus(BoostStatus.ACTIVE);
                boost.setActivatedAt(now);
                applyBoostFlagsToListing(boost.getListing(), boost.getBoostType(), now);
                log.info("Boost {} activated immediately for listing {}", boost.getId(), boost.getListing().getId());
            }
        } else if ("0".equals(ipn.status_code())) {
            payment.setPaymentStatus(PaymentStatus.PENDING);
        } else if ("-1".equals(ipn.status_code())) {
            payment.setPaymentStatus(PaymentStatus.CANCELLED);
            boost.setBoostStatus(BoostStatus.CANCELLED);
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            boost.setBoostStatus(BoostStatus.CANCELLED);
        }

        boostPaymentRepository.save(payment);
        adBoostRepository.save(boost);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdBoostResponse> getMyBoosts() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return adBoostRepository.findByUserIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdBoostResponse> getActiveBoostsForListing(UUID listingId) {
        return adBoostRepository.findActiveByListingId(listingId, OffsetDateTime.now())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void cancelScheduledBoost(UUID boostId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        AdBoost boost = adBoostRepository.findById(boostId)
                .orElseThrow(() -> new ResourceNotFoundException("Boost not found: " + boostId));

        if (!boost.getUser().getId().equals(currentUserId)) {
            throw new ConflictException("You do not have permission to cancel this boost.");
        }

        if (boost.getBoostStatus() != BoostStatus.SCHEDULED && boost.getBoostStatus() != BoostStatus.PENDING_PAYMENT) {
            throw new ConflictException("Only scheduled or pending boosts can be cancelled.");
        }

        boost.setBoostStatus(BoostStatus.CANCELLED);
        adBoostRepository.save(boost);
        log.info("Boost {} cancelled by user {}", boostId, currentUserId);
    }

    @Override
    @Transactional
    public void activateDueScheduledBoosts() {
        OffsetDateTime now = OffsetDateTime.now();
        List<AdBoost> dueBoosts = adBoostRepository.findScheduledDueForActivation(now);
        for (AdBoost boost : dueBoosts) {
            boost.setBoostStatus(BoostStatus.ACTIVE);
            boost.setActivatedAt(now);
            adBoostRepository.save(boost);

            Listing listing = boost.getListing();
            applyBoostFlagsToListing(listing, boost.getBoostType(), now);
            listingRepository.save(listing);
            log.info("Activated scheduled boost {} for listing {}", boost.getId(), listing.getId());
        }
    }

    @Override
    @Transactional
    public void expireCompletedBoosts() {
        OffsetDateTime now = OffsetDateTime.now();
        List<AdBoost> expiredBoosts = adBoostRepository.findActiveDueForExpiry(now);
        Set<UUID> affectedListingIds = new HashSet<>();

        for (AdBoost boost : expiredBoosts) {
            boost.setBoostStatus(BoostStatus.EXPIRED);
            adBoostRepository.save(boost);
            affectedListingIds.add(boost.getListing().getId());
            log.info("Expired boost {} for listing {}", boost.getId(), boost.getListing().getId());
        }

        // Re-evaluate flags on affected listings
        for (UUID listingId : affectedListingIds) {
            Listing listing = listingRepository.findById(listingId).orElse(null);
            if (listing != null) {
                recomputeListingBoostFlags(listing, now);
                listingRepository.save(listing);
            }
        }
    }

    private void applyBoostFlagsToListing(Listing listing, BoostType boostType, OffsetDateTime now) {
        switch (boostType) {
            case SPOTLIGHT -> listing.setSpotlight(true);
            case PUSH_UP -> {
                listing.setPushedUp(true);
                listing.setPushUpLastBumpedAt(now);
            }
            case HOT_DEAL -> listing.setHotDeal(true);
            case POWER_PACK -> {
                listing.setSpotlight(true);
                listing.setHotDeal(true);
                listing.setPushedUp(true);
                listing.setPushUpLastBumpedAt(now);
            }
        }
    }

    private void recomputeListingBoostFlags(Listing listing, OffsetDateTime now) {
        List<AdBoost> active = adBoostRepository.findActiveByListingId(listing.getId(), now);
        boolean hasSpotlight = false;
        boolean hasHotDeal = false;
        boolean hasPushUp = false;

        for (AdBoost b : active) {
            if (b.getBoostType() == BoostType.SPOTLIGHT || b.getBoostType() == BoostType.POWER_PACK) {
                hasSpotlight = true;
            }
            if (b.getBoostType() == BoostType.HOT_DEAL || b.getBoostType() == BoostType.POWER_PACK) {
                hasHotDeal = true;
            }
            if (b.getBoostType() == BoostType.PUSH_UP || b.getBoostType() == BoostType.POWER_PACK) {
                hasPushUp = true;
            }
        }

        listing.setSpotlight(hasSpotlight);
        listing.setHotDeal(hasHotDeal);
        listing.setPushedUp(hasPushUp);
        if (!hasPushUp) {
            listing.setPushUpLastBumpedAt(null);
        }
    }

    private AdBoostResponse mapToResponse(AdBoost b) {
        return new AdBoostResponse(
                b.getId(),
                b.getListing().getId(),
                b.getListing().getTitle(),
                b.getListing().getSlug(),
                b.getBoostType(),
                b.getBoostStatus(),
                b.getDurationDays(),
                b.getStartsAt(),
                b.getExpiresAt(),
                b.getActivatedAt(),
                b.getCreatedAt());
    }
}
