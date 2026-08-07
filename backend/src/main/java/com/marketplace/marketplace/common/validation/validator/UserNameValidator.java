package com.marketplace.marketplace.common.validation.validator;

import com.marketplace.marketplace.common.validation.annotation.UserName;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class UserNameValidator implements ConstraintValidator<UserName, String> {

    /**
     * Rules:
     * - 3 to 30 characters
     * - letters, digits, underscore and hyphen only
     * - cannot start or end with '_' or '-'
     * - no consecutive '__', '--', '_-', or '-_'
     */
    private static final Pattern USERNAME_PATTERN = Pattern.compile(
            "^(?=.{3,30}$)(?![_-])(?!.*[_-]{2})[a-zA-Z0-9_-]+(?<![_-])$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {

        if (value == null || value.isBlank()) {
            return true;
        }

        return USERNAME_PATTERN.matcher(value).matches();
    }
}