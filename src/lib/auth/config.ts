export const AUTH_SESSION_COOKIE_NAME = "auth_session";
export const GUEST_SESSION_COOKIE_NAME = "guest_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const authBaseUrl =
  process.env.BETTER_AUTH_URL ?? "http://localhost:3001";

// Secure cookies are mandatory in production. HTTP localhost remains usable
// during development; an HTTPS development URL opts into Secure as well.
export const shouldUseSecureCookies =
  process.env.NODE_ENV === "production" || authBaseUrl.startsWith("https://");

export const sessionCookieAttributes = {
  httpOnly: true,
  secure: shouldUseSecureCookies,
  sameSite: "strict",
  path: "/",
} as const;
