package com.marketplace.marketplace.listing.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.listing-images")
public class ListingImageProperties {

    private int maxImages = 10;

    private long maxFileSize = 6 * 1024 * 1024;

    private String bucket = "listing-images";
}