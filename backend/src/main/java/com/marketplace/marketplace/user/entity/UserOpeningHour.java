package com.marketplace.marketplace.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
    name = "user_opening_hours",
    indexes = {
        @Index(name = "idx_user_opening_hours_user_id", columnList = "user_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_opening_hours_user_day", columnNames = {"user_id", "day_of_week"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserOpeningHour {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** ISO-8601 day of week: 1 = Monday … 7 = Sunday */
    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;


    @Column(name = "is_closed", nullable = false)
    @Builder.Default
    private Boolean isClosed = false;

    @Column(name = "open_time")
    private LocalTime openTime;

    @Column(name = "close_time")
    private LocalTime closeTime;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public static List<UserOpeningHour> defaultsFor(User user) {
        List<UserOpeningHour> hours = new ArrayList<>(7);
        for (int day = 1; day <= 7; day++) {
            boolean weekend = day >= 6;
            hours.add(UserOpeningHour.builder()
                    .user(user)
                    .dayOfWeek(day)
                    .isClosed(weekend)
                    .openTime(weekend ? null : LocalTime.of(9, 0))
                    .closeTime(weekend ? null : LocalTime.of(17, 0))
                    .build());
        }
        return hours;
    }
}
