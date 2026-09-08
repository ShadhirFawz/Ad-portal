/**
 * Validates and returns a safe relative redirection path.
 * Prevents open-redirect attacks by ensuring the path starts with a single '/'
 * and does not start with '//' or contain protocol schemes.
 */
export function getSafeRedirectUrl(
  target?: string | null,
  fallback = "/"
): string {
  if (!target || typeof target !== "string") {
    return fallback;
  }

  const trimmed = target.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://")) {
    return trimmed;
  }

  return fallback;
}

/**
 * Builds a URL with an optional redirect/returnUrl query parameter.
 */
export function createRedirectUrl(
  destination: string,
  returnUrl?: string | null,
  extraParams?: Record<string, string | undefined | null>
): string {
  const safeReturn = returnUrl ? getSafeRedirectUrl(returnUrl) : null;
  const searchParams = new URLSearchParams();

  if (safeReturn && safeReturn !== "/") {
    searchParams.set("redirect", safeReturn);
  }

  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });
  }

  const queryString = searchParams.toString();
  return queryString ? `${destination}?${queryString}` : destination;
}
