package com.marketplace.marketplace.promotion.config;

import com.marketplace.marketplace.promotion.enums.BoostDuration;
import com.marketplace.marketplace.promotion.enums.BoostType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "app.boost")
@Getter
@Setter
public class BoostPricingProperties {

    private Map<BoostType, Map<BoostDuration, BigDecimal>> pricing = new EnumMap<>(BoostType.class);

    public BoostPricingProperties() {
        // Default LKR pricing tiers
        // SPOTLIGHT
        Map<BoostDuration, BigDecimal> spotlight = new EnumMap<>(BoostDuration.class);
        spotlight.put(BoostDuration.THREE_DAYS, new BigDecimal("490.00"));
        spotlight.put(BoostDuration.SEVEN_DAYS, new BigDecimal("890.00"));
        spotlight.put(BoostDuration.FOURTEEN_DAYS, new BigDecimal("1490.00"));
        spotlight.put(BoostDuration.THIRTY_DAYS, new BigDecimal("2490.00"));
        pricing.put(BoostType.SPOTLIGHT, spotlight);

        // PUSH_UP
        Map<BoostDuration, BigDecimal> pushUp = new EnumMap<>(BoostDuration.class);
        pushUp.put(BoostDuration.THREE_DAYS, new BigDecimal("290.00"));
        pushUp.put(BoostDuration.SEVEN_DAYS, new BigDecimal("490.00"));
        pushUp.put(BoostDuration.FOURTEEN_DAYS, new BigDecimal("850.00"));
        pushUp.put(BoostDuration.THIRTY_DAYS, new BigDecimal("1390.00"));
        pricing.put(BoostType.PUSH_UP, pushUp);

        // HOT_DEAL
        Map<BoostDuration, BigDecimal> hotDeal = new EnumMap<>(BoostDuration.class);
        hotDeal.put(BoostDuration.THREE_DAYS, new BigDecimal("190.00"));
        hotDeal.put(BoostDuration.SEVEN_DAYS, new BigDecimal("350.00"));
        hotDeal.put(BoostDuration.FOURTEEN_DAYS, new BigDecimal("590.00"));
        hotDeal.put(BoostDuration.THIRTY_DAYS, new BigDecimal("990.00"));
        pricing.put(BoostType.HOT_DEAL, hotDeal);

        // POWER_PACK (Spotlight + Push Up + Hot Deal bundle at discounted rate)
        Map<BoostDuration, BigDecimal> powerPack = new EnumMap<>(BoostDuration.class);
        powerPack.put(BoostDuration.THREE_DAYS, new BigDecimal("790.00"));
        powerPack.put(BoostDuration.SEVEN_DAYS, new BigDecimal("1390.00"));
        powerPack.put(BoostDuration.FOURTEEN_DAYS, new BigDecimal("2290.00"));
        powerPack.put(BoostDuration.THIRTY_DAYS, new BigDecimal("3890.00"));
        pricing.put(BoostType.POWER_PACK, powerPack);
    }

    public BigDecimal getPrice(BoostType type, BoostDuration duration) {
        if (pricing.containsKey(type) && pricing.get(type).containsKey(duration)) {
            return pricing.get(type).get(duration);
        }
        return new BigDecimal("490.00"); // Fallback
    }
}
