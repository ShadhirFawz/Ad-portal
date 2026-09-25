package com.marketplace.marketplace.user.mapper;

import com.marketplace.marketplace.auth.dto.response.UserResponse;
import com.marketplace.marketplace.common.storage.SupabaseStorageService;
import com.marketplace.marketplace.user.dto.response.UserOpeningHourResponse;
import com.marketplace.marketplace.user.entity.User;
import com.marketplace.marketplace.user.entity.UserOpeningHour;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private static final String PROFILE_BUCKET = "profile-images";
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private final SupabaseStorageService storageService;

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        String avatarUrl = resolveImageUrl(user.getAvatarUrl());
        String coverPhotoUrl = resolveImageUrl(user.getCoverPhotoUrl());

        java.util.List<com.marketplace.marketplace.user.dto.response.UserPhoneNumberResponse> phoneResponses =
                (user.getPhoneNumbers() == null)
                        ? java.util.Collections.emptyList()
                        : user.getPhoneNumbers().stream()
                                .map(pn -> new com.marketplace.marketplace.user.dto.response.UserPhoneNumberResponse(
                                        pn.getId(),
                                        pn.getPhoneNumber(),
                                        Boolean.TRUE.equals(pn.getIsPrimary()),
                                        Boolean.TRUE.equals(pn.getIsWhatsapp())
                                ))
                                .toList();

        String primaryPhone = user.getPhoneNumber();
        if (primaryPhone == null && !phoneResponses.isEmpty()) {
            primaryPhone = phoneResponses.stream()
                    .filter(p -> Boolean.TRUE.equals(p.isPrimary()))
                    .map(com.marketplace.marketplace.user.dto.response.UserPhoneNumberResponse::phoneNumber)
                    .findFirst()
                    .orElse(phoneResponses.get(0).phoneNumber());
        }

        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getUsername(),
                user.getEmail(),
                primaryPhone,
                phoneResponses,
                avatarUrl,
                coverPhotoUrl,
                user.getBio(),
                user.getLocation(),
                user.getRole(),
                user.getStatus(),
                user.getEmailVerified(),
                user.getPhoneVerified(),
                user.getPublicProfile(),
                user.getCreatedAt(),
                toOpeningHourResponses(user.getOpeningHours())
        );
    }

    private List<UserOpeningHourResponse> toOpeningHourResponses(List<UserOpeningHour> hours) {
        java.util.Map<Integer, UserOpeningHour> byDay = new java.util.HashMap<>();
        if (hours != null) {
            for (UserOpeningHour hour : hours) {
                if (hour.getDayOfWeek() != null) {
                    byDay.put(hour.getDayOfWeek(), hour);
                }
            }
        }

        java.util.List<UserOpeningHourResponse> responses = new java.util.ArrayList<>(7);
        for (UserOpeningHour fallback : UserOpeningHour.defaultsFor(null)) {
            UserOpeningHour hour = byDay.get(fallback.getDayOfWeek());
            responses.add(toOpeningHourResponse(hour != null ? hour : fallback));
        }
        return responses;
    }

    private UserOpeningHourResponse toOpeningHourResponse(UserOpeningHour hour) {
        return new UserOpeningHourResponse(
                hour.getDayOfWeek(),
                Boolean.TRUE.equals(hour.getIsClosed()),
                formatTime(hour.getOpenTime()),
                formatTime(hour.getCloseTime())
        );
    }

    private String formatTime(LocalTime time) {
        return time == null ? null : time.format(TIME_FORMAT);
    }

    private String resolveImageUrl(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return null;
        }
        if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
            return storagePath;
        }
        return storageService.getPublicUrl(PROFILE_BUCKET, storagePath);
    }
}