export const PERSON_NAME_REGEX = /^[\p{L} .'-]{1,100}$/u;
export const PHONE_E164_REGEX = /^\+[1-9]\d{7,14}$/;

export function validatePassword(pw: string): string | null {
  if (!pw) return "Password is required.";
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one digit.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must contain at least one special character.";
  return null;
}

export interface RegisterFormData {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export function validateRegisterForm(data: RegisterFormData): Record<string, string> {
  const errs: Record<string, string> = {};
  const { firstName, lastName, email, phoneNumber, password } = data;

  if (!firstName.trim()) {
    errs.firstName = "First name is required.";
  } else if (!PERSON_NAME_REGEX.test(firstName.trim())) {
    errs.firstName = "Name may only contain letters, spaces, hyphens, apostrophes or dots (max 100 chars).";
  }

  if (lastName && !PERSON_NAME_REGEX.test(lastName.trim())) {
    errs.lastName = "Name may only contain letters, spaces, hyphens, apostrophes or dots (max 100 chars).";
  }

  if (!email.trim()) {
    errs.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errs.email = "Please enter a valid email address.";
  }

  if (phoneNumber && phoneNumber.trim()) {
    if (!PHONE_E164_REGEX.test(phoneNumber.trim())) {
      errs.phoneNumber = "Phone must be in E.164 format, e.g. +94771234567.";
    }
  }

  const pwErr = validatePassword(password);
  if (pwErr) errs.password = pwErr;

  return errs;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export function validateLoginForm(data: LoginFormData): Record<string, string> {
  const errs: Record<string, string> = {};
  const { email, password } = data;
  if (!email.trim()) {
    errs.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errs.email = "Please enter a valid email address.";
  }
  if (!password) {
    errs.password = "Password is required.";
  }
  return errs;
}
