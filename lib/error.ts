import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import type { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"

// Lấy message hữu ích nhất từ API envelope dùng chung.
export function getApiResponseMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const response = payload as { error?: { message?: unknown }; message?: unknown }

    if (typeof response.error?.message === "string" && response.error.message.trim()) {
      return response.error.message
    }

    if (typeof response.message === "string" && response.message.trim()) {
      return response.message
    }
  }

  return fallback
}

// Chuyển lỗi RTK Query thành text sẵn sàng hiển thị.
export function extractErrorMessage(error: unknown): string {
  const err = error as FetchBaseQueryError
  const data = err?.data as ApiResponseType<null> | undefined

  return getApiResponseMessage(data, "Co loi xay ra")
}

// Chuyển lỗi fetch trên server thành text sẵn sàng hiển thị.
export function getServerFetchErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
