package com.marketplace.marketplace.promotion.util;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

@Slf4j
public final class PayHereHashUtil {

    private PayHereHashUtil() {
    }

    public static String getMd5(String input) {
        if (input == null) {
            return "";
        }
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : messageDigest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("Error generating MD5 hash", e);
            throw new RuntimeException("MD5 algorithm not found", e);
        }
    }

    public static String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return "0.00";
        }
        DecimalFormat df = new DecimalFormat("0.00", DecimalFormatSymbols.getInstance(Locale.US));
        df.setRoundingMode(RoundingMode.HALF_UP);
        return df.format(amount);
    }

    /**
     * Generates PayHere checkout verification hash
     */
    public static String generateCheckoutHash(String merchantId, String orderId, BigDecimal amount, String currency,
            String merchantSecret) {
        String formattedAmount = formatAmount(amount);
        String secretHash = getMd5(merchantSecret).toUpperCase();
        String raw = merchantId + orderId + formattedAmount + currency + secretHash;
        return getMd5(raw).toUpperCase();
    }

    /**
     * Verifies PayHere IPN notification hash:
     * strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency +
     * status_code + strtoupper(md5(merchant_secret))))
     */
    public static boolean verifyIpnHash(String merchantId, String orderId, String payhereAmount, String payhereCurrency,
            String statusCode, String md5sig, String merchantSecret) {
        if (md5sig == null) {
            return false;
        }
        String secretHash = getMd5(merchantSecret).toUpperCase();
        String raw = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + secretHash;
        String localSig = getMd5(raw).toUpperCase();
        return localSig.equalsIgnoreCase(md5sig);
    }
}
