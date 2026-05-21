import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { buildLoginIntentRoute } from "@/lib/navigation"
import {
  ACCESS_TOKEN_COOKIE_KEY,
  REFRESH_TOKEN_COOKIE_KEY,
} from "@/server/auth-constants"

const PROTECTED_ROUTES = ["/cart", "/order"]

// Kiểm tra page được request có cần auth session không.
function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

// Redirect khách về modal login và giữ lại route ban đầu.
function redirectToLoginIntent(request: NextRequest) {
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
  const loginUrl = new URL(buildLoginIntentRoute(nextPath), request.url)

  return NextResponse.redirect(loginUrl)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value

  if (!refreshToken && !accessToken) {
    return redirectToLoginIntent(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/cart/:path*", "/order/:path*"],
}
