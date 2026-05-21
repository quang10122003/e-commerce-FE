import type { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import type { RefreshResponse } from "@/types/Auth/RefreshResponse"
import { buildBackendUrl } from "./backend-url"

// call api rềtch token
export async function refreshAccessToken(refreshToken?: string) {
  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(buildBackendUrl("/auth/refresh-token"), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      method: "GET",
    })

    const payload = (await response.json().catch(() => null)) as ApiResponseType<RefreshResponse> | null
    const nextAccessToken = payload?.data?.accessToken

    if (!response.ok || !nextAccessToken) {
      return null
    }

    return nextAccessToken
  } catch {
    return null
  }
}
