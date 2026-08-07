package com.marketplace.marketplace.common.validation.validator;

import com.marketplace.marketplace.common.validation.annotation.PhoneNumber;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator
        implements ConstraintValidator<PhoneNumber, String> {

    @Override
    public boolean isValid(String value,
            ConstraintValidatorContext context) {

        if (value == null || value.isBlank())
            return true;

        return value.matches("^\\+[1-9]\\d{7,14}$");

    }

}