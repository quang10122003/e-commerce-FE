const LOGIN_REDIRECT_STACK_MAX = 20
const loginRedirectStack: string[] = []

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
