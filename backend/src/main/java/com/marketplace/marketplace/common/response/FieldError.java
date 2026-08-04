package com.marketplace.marketplace.common.response;

public class FieldError {

    private String field;

    private String message;

    public FieldError() {
    }

    public FieldError(String field, String message) {
        this.field = field;
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public String getMessage() {
        return message;
    }
}