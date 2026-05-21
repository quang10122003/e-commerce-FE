import type { RouteSearchParams } from "@/lib/search-params"

// Chỉ nhận route nội bộ để redirect không thể rời khỏi site.
export function normalizeInternalRoute(url?: string | null) {
  if (!url) {
    return null
  }

  const trimmedUrl = url.trim()

  if (!trimmedUrl.startsWith("/") || trimmedUrl.startsWith("//")) {
    return null
  }

  return trimmedUrl
}

// Lấy route hiện tại trên browser, hoặc fallback khi render trên server.
export function getCurrentBrowserRoute(fallback: string | null = null) {
  if (typeof window === "undefined") {
    return fallback
  }

  const { hash, pathname, search } = window.location

  return normalizeInternalRoute(`${pathname}${search}${hash}`)
}

// Tạo URL về trang chủ để mở modal login và nhớ nơi cần quay lại.
export function buildLoginIntentRoute(nextPath: string) {
  return `/?auth=login&next=${encodeURIComponent(nextPath)}`
}

// Chuyển params thành query string mà không làm mất key lặp.
export function buildInternalPathWithSearchParams(pathname: string, params: RouteSearchParams) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined) {
          searchParams.append(key, item)
        }
      }
    } else if (value !== undefined) {
      searchParams.set(key, value)
    }
  }

  const queryString = searchParams.toString()

  return queryString ? `${pathname}?${queryString}` : pathname
}
