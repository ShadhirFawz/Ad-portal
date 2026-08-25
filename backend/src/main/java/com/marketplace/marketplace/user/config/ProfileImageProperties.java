package com.marketplace.marketplace.user.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.profile-images")
public class ProfileImageProperties {

    private long maxFileSize = 5 * 1024 * 1024; // 5 MB

    private String bucket = "profile-images";
}
