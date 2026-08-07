package com.marketplace.marketplace.common.validation.validator;

import com.marketplace.marketplace.common.validation.annotation.PersonName;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PersonNameValidator
        implements ConstraintValidator<PersonName, String> {

    private static final String REGEX = "^[\\p{L} .'-]{1,100}$";

    @Override
    public boolean isValid(String value,
            ConstraintValidatorContext context) {

        if (value == null)
            return true;

        return value.matches(REGEX);

    }

}