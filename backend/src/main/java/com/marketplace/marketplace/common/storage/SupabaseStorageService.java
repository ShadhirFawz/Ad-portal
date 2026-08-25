package com.marketplace.marketplace.common.storage;

public interface SupabaseStorageService {

    void delete(
            String bucket,
            String storagePath);

    String getPublicUrl(
            String bucket,
            String storagePath);
}