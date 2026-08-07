package com.marketplace.marketplace.common.validation.annotation;

import com.marketplace.marketplace.common.validation.validator.UserNameValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = UserNameValidator.class)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface UserName {

    String message() default "Username must be 3-30 characters and may contain letters, numbers, hyphens, and underscores.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}