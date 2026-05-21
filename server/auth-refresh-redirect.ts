import type { NextRequest } from "next/server"

// Đánh dấu page request vừa đi qua route refresh token.
export const AUTH_REFRESHED_SEARCH_PARAM = "__auth_refreshed"

// Đưa browser qua route refresh trước khi quay lại page.
export function buildAuthRefreshRoute(nextPath: string) {
  return `/api/auth/refresh?next=${encodeURIComponent(nextPath)}`
}

// Chặn vòng lặp refresh vô hạn khi backend vẫn từ chối request.
export function hasAuthRefreshMarker(path: string) {
  const url = new URL(path, "http://localhost")

  return url.searchParams.get(AUTH_REFRESHED_SEARCH_PARAM) === "1"
}

// Gắn marker vào URL quay lại sau khi refresh token thành công.
export function markAuthRefreshedPath(request: NextRequest, path: string) {
  const url = new URL(path, request.url)

  url.searchParams.set(AUTH_REFRESHED_SEARCH_PARAM, "1")

  return `${url.pathname}${url.search}${url.hash}`
}

// Xóa marker sau khi page đã tải thành công.
export function stripAuthRefreshMarker(path: string) {
  const url = new URL(path, "http://localhost")

  url.searchParams.delete(AUTH_REFRESHED_SEARCH_PARAM)

  return `${url.pathname}${url.search}${url.hash}`
}
