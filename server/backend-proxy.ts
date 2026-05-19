import "server-only"

import { NextResponse, type NextRequest } from "next/server"
import type { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import type { AuthResponse } from "@/types/Auth/AuthResponse"
import { refreshAccessToken } from "./auth-refresh"
import {
  clearSession,
  getRequestSession,
  setAccessTokenSession,
  setLoginSession,
} from "./auth-session"
import { fetchBackendRaw } from "./backend-fetch"

export type BackendProxyRouteContext = {
  params: Promise<{
    path: string[]
  }>
}

const LOCAL_LOGOUT_PATH = "/auth/logout"
const PUBLIC_BACKEND_PATHS = new Set(["/auth/login", "/auth/signup", "/categories", "/products/active", "/products/topSelling"])
const REQUEST_HEADERS = ["accept", "content-type"]
const RESPONSE_HEADERS = ["content-type", "content-disposition", "cache-control"]

function isEmptyResponse(status: number) {
  return status === 204 || status === 205 || status === 304
}

function isPublicBackendPath(pathname: string) {
  return PUBLIC_BACKEND_PATHS.has(pathname) || /^\/products\/\d+$/.test(pathname)
}

async function buildBackendPath(request: NextRequest, context: BackendProxyRouteContext) {
  const { path } = await context.params
  const pathname = `/${path.map(encodeURIComponent).join("/")}`

  return {
    pathname,
    pathWithSearch: `${pathname}${request.nextUrl.search}`,
  }
}

function pickRequestHeaders(request: NextRequest) {
  const headers = new Headers()

  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name)

    if (value) {
      headers.set(name, value)
    }
  }

  return headers
}

function pickResponseHeaders(headers: Headers) {
  const nextHeaders = new Headers()

  for (const name of RESPONSE_HEADERS) {
    const value = headers.get(name)

    if (value) {
      nextHeaders.set(name, value)
    }
  }

  return nextHeaders
}

async function readRequestBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined
  }

  const body = await request.arrayBuffer()

  return body.byteLength > 0 ? body : undefined
}

function parseJson(buffer: ArrayBuffer, contentType: string | null) {
  if (!contentType?.includes("application/json") || buffer.byteLength === 0) {
    return null
  }

  try {
    return JSON.parse(new TextDecoder().decode(buffer)) as unknown
  } catch {
    return null
  }
}

function isAuthPayload(payload: unknown): payload is ApiResponseType<AuthResponse> {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("data" in payload) ||
    typeof payload.data !== "object" ||
    payload.data === null
  ) {
    return false
  }

  const data = payload.data as Partial<AuthResponse>

  return typeof data.accessToken === "string" && typeof data.refreshToken === "string"
}

function buildErrorResponse(message: string): ApiResponseType<null> {
  return {
    data: null,
    error: {
      errorCode: "NEXT_PROXY_ERROR",
      message,
    },
    message,
    success: false,
    timestamp: new Date().toISOString(),
  }
}

function jsonResponse(payload: ApiResponseType<null>, status: number) {
  return NextResponse.json(payload, { status })
}

function handleLocalLogout() {
  const response = jsonResponse(
    {
      data: null,
      error: null,
      message: "Dang xuat thanh cong.",
      success: true,
      timestamp: new Date().toISOString(),
    },
    200
  )

  clearSession(response)

  return response
}

async function toNextResponse(backendResponse: Response) {
  const buffer = await backendResponse.arrayBuffer()
  const contentType = backendResponse.headers.get("content-type")
  const payload = parseJson(buffer, contentType)
  const response = new NextResponse(isEmptyResponse(backendResponse.status) ? null : buffer, {
    headers: pickResponseHeaders(backendResponse.headers),
    status: backendResponse.status,
  })

  return { payload, response }
}

export async function handleBackendProxyRequest(
  request: NextRequest,
  context: BackendProxyRouteContext
) {
  const { pathname, pathWithSearch } = await buildBackendPath(request, context)

  if (pathname === LOCAL_LOGOUT_PATH) {
    return handleLocalLogout()
  }

  const session = getRequestSession(request)
  const isPublicPath = isPublicBackendPath(pathname)
  const requestBody = await readRequestBody(request)
  const requestHeaders = pickRequestHeaders(request)

  try {
    let backendResponse = await fetchBackendRaw(pathWithSearch, {
      accessToken: isPublicPath ? undefined : session.accessToken,
      body: requestBody,
      headers: requestHeaders,
      method: request.method,
    })

    let nextAccessToken: string | null = null

    // A private browser call gets one server-side refresh attempt before the user is logged out.
    if (!isPublicPath && backendResponse.status === 401 && session.refreshToken) {
      nextAccessToken = await refreshAccessToken(session.refreshToken)

      if (nextAccessToken) {
        backendResponse = await fetchBackendRaw(pathWithSearch, {
          accessToken: nextAccessToken,
          body: requestBody,
          headers: requestHeaders,
          method: request.method,
        })
      }
    }

    const { payload, response } = await toNextResponse(backendResponse)

    if (
      (pathname === "/auth/login" || pathname === "/auth/signup") &&
      backendResponse.ok &&
      isAuthPayload(payload) &&
      payload.data
    ) {
      setLoginSession(response, payload.data)
    } else if (nextAccessToken && backendResponse.ok) {
      setAccessTokenSession(response, nextAccessToken)
    } else if (!isPublicPath && backendResponse.status === 401) {
      clearSession(response)
    }

    return response
  } catch {
    return jsonResponse(buildErrorResponse("Khong the ket noi backend."), 502)
  }
}
