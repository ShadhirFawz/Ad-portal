package com.marketplace.marketplace.common.response;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.validation.FieldError;

public class ErrorResponse {

    private boolean success = false;

    private String message;

    private List<FieldError> errors;

    private LocalDateTime timestamp = LocalDateTime.now();

    public ErrorResponse() {
    }

    public ErrorResponse(String message, List<FieldError> errors) {
        this.message = message;
        this.errors = errors;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public List<FieldError> getErrors() {
        return errors;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}