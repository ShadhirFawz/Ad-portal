package com.marketplace.marketplace.promotion.scheduler;

import com.marketplace.marketplace.promotion.service.BoostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BoostScheduler {

    private final BoostService boostService;

    /**
     * Runs every 1 minute to activate any scheduled boosts whose start time has arrived.
     */
    @Scheduled(fixedDelay = 60000)
    public void runScheduledBoostActivations() {
        try {
            boostService.activateDueScheduledBoosts();
        } catch (Exception e) {
            log.error("Error during scheduled boost activation job", e);
        }
    }

    /**
     * Runs every 5 minutes to expire any active boosts whose duration has passed.
     */
    @Scheduled(fixedDelay = 300000)
    public void runBoostExpiryCheck() {
        try {
            boostService.expireCompletedBoosts();
        } catch (Exception e) {
            log.error("Error during boost expiry job", e);
        }
    }
}
