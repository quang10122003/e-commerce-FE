import "server-only"

import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"
import type { AuthResponse } from "@/types/Auth/AuthResponse"
import {
  ACCESS_TOKEN_COOKIE_KEY,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_KEY,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  ROLE_COOKIE_KEY,
} from "./auth-constants"

export type AuthSession = {
  accessToken?: string
  refreshToken?: string
  role?: string
}

// Áp dụng policy cookie auth dùng chung với thời hạn cụ thể.
function cookieOptions(maxAge: number) {
  return {
    ...AUTH_COOKIE_OPTIONS,
    maxAge,
  }
}

// Đọc cookie auth từ Server Component và Route Handler.
export async function getServerSession(): Promise<AuthSession> {
  const cookieStore = await cookies()

  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE_KEY)?.value,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE_KEY)?.value,
    role: cookieStore.get(ROLE_COOKIE_KEY)?.value,
  }
}

// Đọc cookie auth trực tiếp từ request đi vào proxy.
export function getRequestSession(request: NextRequest): AuthSession {
  return {
    accessToken: request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value,
    refreshToken: request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value,
    role: request.cookies.get(ROLE_COOKIE_KEY)?.value,
  }
}

// Lưu access token mới sau login hoặc refresh.
export function setAccessTokenSession(response: NextResponse, accessToken: string) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE_KEY,
    accessToken,
    cookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS)
  )
}
// Lưu toàn bộ cookie auth backend trả về sau login/signup.
export function setLoginSession(response: NextResponse, auth: AuthResponse) {
  setAccessTokenSession(response, auth.accessToken)

  response.cookies.set(
    REFRESH_TOKEN_COOKIE_KEY,
    auth.refreshToken,
    cookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS)
  )

  response.cookies.set(ROLE_COOKIE_KEY, auth.role, cookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS))
}

// Hết hạn toàn bộ cookie auth trên response trả ra.
export function clearSession(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE_KEY, "", cookieOptions(0))
  response.cookies.set(REFRESH_TOKEN_COOKIE_KEY, "", cookieOptions(0))
  response.cookies.set(ROLE_COOKIE_KEY, "", cookieOptions(0))
}
