package com.marketplace.marketplace.common.validation.annotation;

import com.marketplace.marketplace.common.validation.validator.PersonNameValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PersonNameValidator.class)
public @interface PersonName {

    String message() default "Invalid name.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

}