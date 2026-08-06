package com.marketplace.marketplace.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

@MappedSuperclass
public abstract class BaseUuidEntity extends BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    public UUID getId() {
        return id;
    }

    public UUID getIdValue() {
        return id;
    }
}
