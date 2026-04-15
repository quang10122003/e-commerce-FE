import { BaseQueryApi } from "@reduxjs/toolkit/query"
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios"
import { API_BASE_URL } from "@/lib/api"
import { clearAuthenticatedUser } from "@/features/auth/authSlice"
import { openLogin } from "@/features/auth/loginSlice"
import { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import { RefreshResponse } from "@/types/Auth/RefreshResponse"
import {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
} from "@/features/auth/authStorage"

const ACCESS_TOKEN_REFRESH_WINDOW_MS = 10 * 60 * 1000
const LOGIN_REDIRECT_STACK_MAX = 20
const loginRedirectStack: string[] = []

type PrivateRequestMetadata = {
    // Danh dau request da retry de response interceptor khong lap vo han.
    _retry?: boolean
    // Giu RTK Query api de interceptor co the dispatch khi phien dang nhap that bai.
    rtkApi?: BaseQueryApi
}

export type PrivateAxiosRequestConfig = AxiosRequestConfig & PrivateRequestMetadata
type PrivateInternalAxiosRequestConfig = InternalAxiosRequestConfig & PrivateRequestMetadata

// Chi cho phep mot request refresh token chay tai mot thoi diem de tranh refresh storm.

let refreshPromise: Promise<string | null> | null = null

export const privateApi = axios.create({
    baseURL: API_BASE_URL,
})

const refreshApi = axios.create({
    baseURL: API_BASE_URL,
})

function normalizeInternalRoute(url?: string | null) {
    if (!url) {
        return null
    }

    const trimmedUrl = url.trim()

    if (!trimmedUrl.startsWith("/") || trimmedUrl.startsWith("//")) {
        return null
    }

    return trimmedUrl
}

export function pushPendingRedirectUrl(url?: string | null) {
    const normalizedUrl = normalizeInternalRoute(url)

    if (!normalizedUrl) {
        return null
    }

    const previousUrl = loginRedirectStack[loginRedirectStack.length - 1]

    if (previousUrl !== normalizedUrl) {
        loginRedirectStack.push(normalizedUrl)

        if (loginRedirectStack.length > LOGIN_REDIRECT_STACK_MAX) {
            loginRedirectStack.shift()
        }
    }

    return normalizedUrl
}

export function popPendingRedirectUrl() {
    return loginRedirectStack.pop() ?? null
}

export function clearPendingRedirectUrls() {
    loginRedirectStack.length = 0
}

function normalizeRequestUrl(url?: string) {
    if (!url) {
        return ""
    }

    return url.replace(/^\/+/, "")
}

function shouldPromptReLogin(url?: string) {
    // /auth/me thuong duoc goi trong luc bootstrap app, nen tranh bat login modal qua som.
    return normalizeRequestUrl(url) !== "auth/me"
}

function getCurrentBrowserPath() {
    if (typeof window === "undefined") {
        return null
    }

    const { hash, pathname, search } = window.location

    if (!pathname.startsWith("/")) {
        return null
    }

    return `${pathname}${search}${hash}`
}

function clearAuthState(api?: BaseQueryApi) {
    if (!api) {
        return
    }

    clearAuthenticatedUser(api.dispatch)
}

function handleUnrecoverableSession(
    api?: BaseQueryApi,
    requestUrl?: string
) {
    // Reset auth state truoc, sau do moi quyet dinh co mo login modal hay khong.
    clearAuthState(api)

    if (!api || !shouldPromptReLogin(requestUrl)) {
        return
    }

    pushPendingRedirectUrl(getCurrentBrowserPath())
    api.dispatch(openLogin())
}

function setAuthorizationHeader(
    config: { headers?: unknown },
    accessToken: string
) {
    // Axios co the tra ve headers dang object thuong hoac AxiosHeaders.
    const headers = (config.headers ?? {}) as {
        Authorization?: string
        set?: (headerName: string, value: string) => void
    }

    if (typeof headers.set === "function") {
        headers.set("Authorization", `Bearer ${accessToken}`)
    } else {
        headers.Authorization = `Bearer ${accessToken}`
    }

    config.headers = headers
}

function hasAuthorizationHeader(config: { headers?: unknown }) {
    const headers = (config.headers ?? {}) as {
        Authorization?: string
        get?: (headerName: string) => string | undefined
    }

    if (typeof headers.get === "function") {
        return Boolean(headers.get("Authorization"))
    }

    return Boolean(headers.Authorization)
}

function decodeBase64Url(value: string) {
    const normalizedValue = value.replace(/-/g, "+").replace(/_/g, "/")
    const padding = normalizedValue.length % 4
    const paddedValue = padding === 0
        ? normalizedValue
        : normalizedValue.padEnd(normalizedValue.length + (4 - padding), "=")

    if (typeof window === "undefined" || typeof window.atob !== "function") {
        return null
    }

    try {
        return window.atob(paddedValue)
    } catch {
        return null
    }
}

function getAccessTokenExpiry(accessToken: string) {
    const [, payload] = accessToken.split(".")

    if (!payload) {
        return null
    }

    const decodedPayload = decodeBase64Url(payload)

    if (!decodedPayload) {
        return null
    }

    try {
        const parsedPayload = JSON.parse(decodedPayload) as { exp?: unknown }

        if (typeof parsedPayload.exp !== "number") {
            return null
        }

        return parsedPayload.exp * 1000
    } catch {
        return null
    }
}

function shouldRefreshAccessToken(accessToken: string) {
    // Lam moi token som mot khoang de request khong bi roi vao luc token vua het han.
    const accessTokenExpiry = getAccessTokenExpiry(accessToken)

    if (!accessTokenExpiry) {
        return false
    }

    return accessTokenExpiry - Date.now() <= ACCESS_TOKEN_REFRESH_WINDOW_MS
}

async function refreshAccessToken() {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
        return null
    }

    // Giu lai promise dang refresh de cac request toi sau cung cho mot ket qua chung.
    if (!refreshPromise) {
        refreshPromise = refreshApi
            .request<ApiResponseType<RefreshResponse>>({
                url: "/auth/refresh-token",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            })
            .then((response) => {
                const nextAccessToken = response.data.data?.accessToken ?? null

                if (!nextAccessToken) {
                    return null
                }

                setAccessToken(nextAccessToken)
                return nextAccessToken
            })
            .catch(() => {
                return null
            })
            .finally(() => {
                refreshPromise = null
            })
    }

    return refreshPromise
}

privateApi.interceptors.request.use(
    async (config: PrivateInternalAxiosRequestConfig) => {
        let accessToken = getAccessToken()
        // Tu dong lam moi access token neu token sap het han va request chua tu set Authorization.

        if (!hasAuthorizationHeader(config) && accessToken && shouldRefreshAccessToken(accessToken)) {
            const nextAccessToken = await refreshAccessToken()

            if (nextAccessToken) {
                accessToken = nextAccessToken
            }
        }

        if (accessToken && !hasAuthorizationHeader(config)) {
            setAuthorizationHeader(config, accessToken)
        }

        return config
    }
)

privateApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as PrivateAxiosRequestConfig | undefined
        const api = originalRequest?.rtkApi
        // Chi xu ly rieng 401 vi day la nhom loi lien quan den phien dang nhap.

        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error)
        }

        // Moi request chi duoc retry mot lan de tranh vong lap vo han.
        if (originalRequest._retry) {
            handleUnrecoverableSession(api, originalRequest.url)
            return Promise.reject(error)
        }

        originalRequest._retry = true
        // Neu refresh thanh cong thi phat lai dung request vua bi 401 voi token moi.

        const nextAccessToken = await refreshAccessToken()

        if (!nextAccessToken) {
            handleUnrecoverableSession(api, originalRequest.url)
            return Promise.reject(error)
        }

        setAuthorizationHeader(originalRequest, nextAccessToken)

        return privateApi.request(originalRequest)
    }
)
