const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"

function canUseStorage() {
    // Bao ve code khoi SSR environment, noi localStorage khong ton tai.
    return typeof window !== "undefined"
}

export function getAccessToken() {
    if (!canUseStorage()) {
        return null
    }

    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
    if (!canUseStorage()) {
        return null
    }

    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAccessToken(accessToken: string) {
    if (!canUseStorage()) {
        return
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export function setRefreshToken(refreshToken: string) {
    if (!canUseStorage()) {
        return
    }

    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function setStoredAuth(tokens: {
    accessToken: string
    refreshToken: string
}) {
    setAccessToken(tokens.accessToken)
    setRefreshToken(tokens.refreshToken)
}

export function clearStoredAuth() {
    if (!canUseStorage()) {
        return
    }

    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
}
