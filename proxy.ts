import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  ACCESS_TOKEN_COOKIE_KEY,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_KEY,
} from "@/server/auth-constants"
import { refreshAccessToken } from "@/server/auth-refresh"

const PROTECTED_ROUTES = ["/cart", "/order"]

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function redirectToLoginIntent(request: NextRequest) {
  const loginUrl = new URL("/", request.url)
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`

  loginUrl.searchParams.set("auth", "login")
  loginUrl.searchParams.set("next", nextPath)

  return NextResponse.redirect(loginUrl)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value

  if (accessToken) {
    return NextResponse.next()
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value
  const nextAccessToken = await refreshAccessToken(refreshToken)

  if (!nextAccessToken) {
    return redirectToLoginIntent(request)
  }

  const response = NextResponse.next()

  // Proxy only performs a quick route guard; the API route remains the source of truth for auth.
  response.cookies.set(ACCESS_TOKEN_COOKIE_KEY, nextAccessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  })

  return response
}

export const config = {
  matcher: ["/cart/:path*", "/order/:path*"],
}
