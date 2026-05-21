const DEFAULT_BACKEND_URL = "http://localhost:8080/api"

const BACKEND_URL =
  process.env.BACKEND_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL_API ??
  DEFAULT_BACKEND_URL

// build api để call backedn
export function buildBackendUrl(path: string) {
  return `${BACKEND_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
}
