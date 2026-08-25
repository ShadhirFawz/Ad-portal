package com.marketplace.marketplace.common.storage;

import com.marketplace.marketplace.common.config.SupabaseProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class SupabaseStorageServiceImpl
        implements SupabaseStorageService {

    private final RestClient supabaseRestClient;

    private final SupabaseProperties properties;

    @Override
    public void delete(
            String bucket,
            String storagePath) {

        try {

            supabaseRestClient
                    .delete()
                    .uri(uriBuilder -> uriBuilder
                            .path(
                                    "/storage/v1/object/{bucket}")
                            .path("/")
                            .path(storagePath)
                            .build(bucket))
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Failed to delete file from Supabase Storage.",
                    exception);
        }
    }

    @Override
    public String getPublicUrl(
            String bucket,
            String storagePath) {

        if (storagePath == null || storagePath.isBlank()) {
            return null;
        }

        if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
            return storagePath;
        }

        String cleanPath = storagePath.startsWith("/") ? storagePath.substring(1) : storagePath;

        return properties.getUrl()
                + "/storage/v1/object/public/"
                + bucket
                + "/"
                + cleanPath;
    }
}