import { NextResponse, type NextRequest } from "next/server"

import { buildLoginIntentRoute, normalizeInternalRoute } from "@/lib/navigation"
import { REFRESH_TOKEN_COOKIE_KEY } from "@/server/auth-constants"
import { markAuthRefreshedPath } from "@/server/auth-refresh-redirect"
import { refreshAccessToken } from "@/server/auth-refresh"
import { clearSession, setAccessTokenSession } from "@/server/auth-session"

// Route này luôn chạy động vì phụ thuộc cookie của từng request.
export const dynamic = "force-dynamic"

// Chỉ cho phép redirect về đường dẫn nội bộ của ứng dụng.
function getSafeNextPath(request: NextRequest) {
  const nextPath = request.nextUrl.searchParams.get("next")

  return normalizeInternalRoute(nextPath) ?? "/"
}

// Tạo response redirect để có thể gắn Set-Cookie.
function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url))
}

export async function GET(request: NextRequest) {
  // Đích cần quay lại sau khi refresh token kết thúc.
  const nextPath = getSafeNextPath(request)
  // Token làm mới lấy từ cookie httpOnly của trình duyệt.
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value

  if (!refreshToken) {
    const response = redirectTo(request, buildLoginIntentRoute(nextPath))

    clearSession(response)

    return response
  }

  // Đổi refresh token lấy access token mới.
  const nextAccessToken = await refreshAccessToken(refreshToken)

  if (!nextAccessToken) {
    const response = redirectTo(request, buildLoginIntentRoute(nextPath))

    clearSession(response)

    return response
  }

  // Quay lại page cũ kèm marker để tránh vòng lặp refresh.
  const response = redirectTo(request, markAuthRefreshedPath(request, nextPath))

  // Response của Route Handler có thể ghi cookie ổn định cho trình duyệt.
  setAccessTokenSession(response, nextAccessToken)

  return response
}
