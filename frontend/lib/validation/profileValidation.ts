import { PERSON_NAME_REGEX, PHONE_E164_REGEX } from "./authValidation";
import type { UserPhoneNumberPayload } from "@/lib/api/users";

export const USERNAME_REGEX = /^(?=.{3,30}$)(?![_-])(?!.*[_-]{2})[a-zA-Z0-9_-]+(?<![_-])$/;

export interface EditProfileFormData {
  firstName: string;
  lastName?: string;
  username?: string;
  bio?: string;
  location?: string;
  phoneNumbers: UserPhoneNumberPayload[];
}

export interface PhoneNumberValidationResult {
  isValid: boolean;
  error?: string;
  cleanedPhoneNumbers: UserPhoneNumberPayload[];
}

export function validatePhoneNumbers(
  phoneNumbers: UserPhoneNumberPayload[]
): PhoneNumberValidationResult {
  const validPhoneNumbers = (phoneNumbers || [])
    .map((p) => ({
      ...p,
      phoneNumber: p.phoneNumber.trim(),
    }))
    .filter((p) => p.phoneNumber.length > 0);

  if (validPhoneNumbers.length > 3) {
    return {
      isValid: false,
      error: "Maximum 3 phone numbers allowed.",
      cleanedPhoneNumbers: validPhoneNumbers,
    };
  }

  for (const p of validPhoneNumbers) {
    if (!PHONE_E164_REGEX.test(p.phoneNumber)) {
      return {
        isValid: false,
        error: `Invalid phone number format: "${p.phoneNumber}". Please use E.164 international format (e.g. +94771234567).`,
        cleanedPhoneNumbers: validPhoneNumbers,
      };
    }
  }

  const numSet = new Set(validPhoneNumbers.map((p) => p.phoneNumber));
  if (numSet.size < validPhoneNumbers.length) {
    return {
      isValid: false,
      error: "Duplicate phone numbers are not allowed.",
      cleanedPhoneNumbers: validPhoneNumbers,
    };
  }

  if (validPhoneNumbers.length > 0 && !validPhoneNumbers.some((p) => p.isPrimary)) {
    validPhoneNumbers[0].isPrimary = true;
  }

  return {
    isValid: true,
    cleanedPhoneNumbers: validPhoneNumbers,
  };
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  errorMessage?: string;
  cleanedPhoneNumbers: UserPhoneNumberPayload[];
}

export function validateEditProfileForm(
  data: EditProfileFormData
): ProfileValidationResult {
  const errors: Record<string, string> = {};
  const { firstName, lastName, username, bio, location, phoneNumbers } = data;

  if (!firstName || !firstName.trim()) {
    errors.firstName = "First name is required.";
  } else if (!PERSON_NAME_REGEX.test(firstName.trim())) {
    errors.firstName = "Name may only contain letters, spaces, hyphens, apostrophes or dots (max 100 chars).";
  }

  if (lastName && lastName.trim()) {
    if (!PERSON_NAME_REGEX.test(lastName.trim())) {
      errors.lastName = "Name may only contain letters, spaces, hyphens, apostrophes or dots (max 100 chars).";
    }
  }

  if (username && username.trim()) {
    if (!USERNAME_REGEX.test(username.trim())) {
      errors.username = "Username must be 3-30 characters with letters, numbers, hyphens or underscores.";
    }
  }

  if (bio && bio.length > 500) {
    errors.bio = "Bio must not exceed 500 characters.";
  }

  if (location && location.trim().length > 100) {
    errors.location = "Location must not exceed 100 characters.";
  }

  const phoneValidation = validatePhoneNumbers(phoneNumbers);
  if (!phoneValidation.isValid && phoneValidation.error) {
    errors.phoneNumbers = phoneValidation.error;
  }

  const firstErrorKey = Object.keys(errors)[0];
  const errorMessage = firstErrorKey ? errors[firstErrorKey] : undefined;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    errorMessage,
    cleanedPhoneNumbers: phoneValidation.cleanedPhoneNumbers,
  };
}
