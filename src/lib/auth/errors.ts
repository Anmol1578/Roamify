export interface ClerkApiErrorItem {
  code?: string;
  message?: string;
  longMessage?: string;
}

export interface ClerkErrorLike {
  errors?: ClerkApiErrorItem[];
  message?: string;
}

const ERROR_CODE_MAP: Record<string, string> = {
  form_identifier_exists: "That email is already in use.",
  form_identifier_not_found: "Email or password is incorrect.",
  form_password_incorrect: "Email or password is incorrect.",
  form_code_incorrect: "That code isn't right. Check your email and try again.",
  verification_expired: "That code has expired. Tap Resend to get a new one.",
  form_password_pwned: "This password has appeared in a data breach. Choose a different one.",
  too_many_requests: "Too many attempts. Wait a moment and try again.",
};

export function authErrorMessage(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  const err = error as ClerkErrorLike;
  const firstError = err.errors?.[0];

  // Specific mapped codes (e.g. invalid credentials, expired code)
  if (firstError?.code && ERROR_CODE_MAP[firstError.code]) {
    return ERROR_CODE_MAP[firstError.code];
  }

  // Use Clerk's exact message (e.g. "Passwords must be 15 characters or more.")
  if (firstError?.longMessage) {
    return firstError.longMessage;
  }

  const rawItem = firstError as Record<string, string> | undefined;
  if (rawItem?.long_message) {
    return rawItem.long_message;
  }

  if (firstError?.message) {
    return firstError.message;
  }

  if (typeof err.message === "string" && err.message) {
    return err.message;
  }

  return "Something went wrong. Please try again.";
}
