import "server-only"

import { redirect } from "next/navigation"

import { getApiResponseMessage } from "@/lib/error"
import type { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import { refreshAccessToken } from "./auth-refresh"
import { buildAuthRefreshRoute, hasAuthRefreshMarker } from "./auth-refresh-redirect"
import { getServerSession } from "./auth-session"
import { buildBackendUrl } from "./backend-url"

const DEFAULT_TIMEOUT_MS = 30_000

type JsonBody = Record<string, unknown> | unknown[]
type BackendRequestBody = BodyInit | JsonBody | null
type NextFetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

export type BackendFetchOptions = Omit<NextFetchOptions, "body" | "headers"> & {
  accessToken?: string
  body?: BackendRequestBody
  headers?: HeadersInit
  refreshRedirectPath?: string
  timeoutMs?: number
}

type NormalizedBody = {
  body: BodyInit | null | undefined
  isJson: boolean
}

// Mang theo payload lỗi backend để nơi gọi xử lý theo từng status.
export class BackendResponseError extends Error {
  payload: unknown
  status: number

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = "BackendResponseError"
    this.payload = payload
    this.status = status
  }
}

// Nhận diện object hoặc array JS thuần cần gửi dưới dạng JSON.
function isJsonBody(body: BackendRequestBody | undefined): body is JsonBody {
  if (!body || typeof body !== "object") {
    return false
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return false
  }

  if (body instanceof URLSearchParams || body instanceof Blob) {
    return false
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return false
  }

  if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
    return false
  }

  return true
}

// Chuyển body giống JSON và giữ nguyên các kiểu body native của fetch.
function normalizeBody(body: BackendRequestBody | undefined): NormalizedBody {
  if (body === undefined || body === null) {
    return { body, isJson: false }
  }

  if (isJsonBody(body)) {
    return { body: JSON.stringify(body), isJson: true }
  }

  return { body, isJson: false }
}

// Tạo header gửi lên backend và gắn auth khi có.
function buildHeaders(
  headersInit: HeadersInit | undefined,
  accessToken: string | undefined,
  hasJsonBody: boolean
) {
  const headers = new Headers(headersInit)

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  return headers
}

// Chạy fetch với cả tín hiệu hủy từ caller và timeout cứng.
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const abortByCaller = () => controller.abort()

  if (init.signal?.aborted) {
    controller.abort()
  } else {
    init.signal?.addEventListener("abort", abortByCaller, { once: true })
  }

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
    init.signal?.removeEventListener("abort", abortByCaller)
  }
}

// Ánh xạ option nội bộ về nhóm option fetch chấp nhận.
function toFetchInit(
  options: BackendFetchOptions,
  body: BodyInit | null | undefined,
  headers: Headers
): NextFetchOptions {
  return {
    body,
    cache: options.cache ?? "no-store",
    credentials: options.credentials,
    headers,
    integrity: options.integrity,
    keepalive: options.keepalive,
    method: options.method,
    mode: options.mode,
    next: options.next,
    redirect: options.redirect,
    referrer: options.referrer,
    referrerPolicy: options.referrerPolicy,
    signal: options.signal,
  }
}

// Đọc JSON an toàn để body rỗng hoặc lỗi không che mất status.
async function readJson<TData>(response: Response) {
  return (await response.json().catch(() => null)) as TData | null
}

// Gửi request thô tới backend với body, header và timeout đã chuẩn hóa.
export async function fetchBackendRaw(path: string, options: BackendFetchOptions = {}) {
  const { body, isJson } = normalizeBody(options.body)
  const headers = buildHeaders(options.headers, options.accessToken, isJson)

  return fetchWithTimeout(
    buildBackendUrl(path),
    toFetchInit(options, body, headers),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  )
}

// Phân tích API envelope và ném lỗi có kiểu cho response không phải 2xx.
async function requestBackendJson<TData>(
  path: string,
  options: BackendFetchOptions
): Promise<ApiResponseType<TData>> {
  const response = await fetchBackendRaw(path, options)
  const payload = await readJson<ApiResponseType<TData>>(response)

  if (!response.ok) {
    throw new BackendResponseError(
      getApiResponseMessage(payload, "Backend tra ve loi. Vui long thu lai."),
      response.status,
      payload
    )
  }

  if (!payload) {
    throw new Error("Backend khong tra ve JSON hop le.")
  }

  return payload
}

// Fetch endpoint public của backend mà không gắn token người dùng.
export function serverPublicFetch<TData>(
  path: string,
  options: Omit<BackendFetchOptions, "accessToken"> = {}
) {
  return requestBackendJson<TData>(path, options)
}

// Fetch endpoint riêng tư và làm mới auth khi SSR có thể tự phục hồi.
export async function serverPrivateFetch<TData>(
  path: string,
  options: Omit<BackendFetchOptions, "accessToken"> = {}
) {
  const session = await getServerSession()
  let accessToken = session.accessToken
  const refreshRedirectPath = options.refreshRedirectPath
  const canRedirectToRefresh = refreshRedirectPath
    ? !hasAuthRefreshMarker(refreshRedirectPath)
    : false

  if (!accessToken && session.refreshToken) {
    // Server Component không lưu cookie ổn định, nên redirect qua Route Handler khi có thể.
    if (refreshRedirectPath && canRedirectToRefresh) {
      redirect(buildAuthRefreshRoute(refreshRedirectPath))
    }

    accessToken = (await refreshAccessToken(session.refreshToken)) ?? undefined
  }

  try {
    return await requestBackendJson<TData>(path, {
      ...options,
      accessToken,
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof BackendResponseError && error.status === 401 && session.refreshToken) {
      // Access token hết hạn có thể phục hồi một lần bằng làm mới rồi retry.
      if (refreshRedirectPath && canRedirectToRefresh) {
        redirect(buildAuthRefreshRoute(refreshRedirectPath))
      }

      const nextAccessToken = await refreshAccessToken(session.refreshToken)

      if (nextAccessToken) {
        return requestBackendJson<TData>(path, {
          ...options,
          accessToken: nextAccessToken,
          cache: "no-store",
        })
      }
    }

    throw error
  }
}
