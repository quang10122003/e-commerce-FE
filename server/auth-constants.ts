export const ACCESS_TOKEN_COOKIE_KEY = "accessToken"
export const REFRESH_TOKEN_COOKIE_KEY = "refreshToken"
export const ROLE_COOKIE_KEY = "role"

export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 3

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
}
