import { normalizeInternalRoute } from "@/lib/navigation"

// Giới hạn số redirect đang chờ để session client không tăng vô hạn.
const LOGIN_REDIRECT_STACK_MAX = 20
// Lưu các route nội bộ cần khôi phục sau khi login.
const loginRedirectStack: string[] = []

// Đẩy URL quay lại hợp lệ, bỏ qua giá trị sai và URL trùng liền trước.
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

// Lấy URL quay lại mới nhất sau khi login thành công.
export function popPendingRedirectUrl() {
  return loginRedirectStack.pop() ?? null
}

// Xóa các URL quay lại đang chờ khi reset trạng thái auth.
export function clearPendingRedirectUrls() {
  loginRedirectStack.length = 0
}
