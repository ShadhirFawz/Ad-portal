package com.marketplace.marketplace.common.validation.validator;

import com.marketplace.marketplace.common.validation.annotation.StrongPassword;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator
        implements ConstraintValidator<StrongPassword, String> {

    @Override
    public boolean isValid(String password,
            ConstraintValidatorContext context) {

        if (password == null) {
            return false;
        }

        if (password.length() < 8) {
            return false;
        }

        boolean upper = false;
        boolean lower = false;
        boolean digit = false;
        boolean special = false;

        for (char c : password.toCharArray()) {

            if (Character.isUpperCase(c))
                upper = true;

            else if (Character.isLowerCase(c))
                lower = true;

            else if (Character.isDigit(c))
                digit = true;

            else
                special = true;

        }

        return upper && lower && digit && special;

    }

}