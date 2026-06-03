import { redirect, unstable_rethrow } from "next/navigation"

import CartPageClient from "@/components/cart/CartPageClient"
import { getServerFetchErrorMessage } from "@/lib/error"
import { readSearchParam, type RouteSearchParams } from "@/lib/search-params"
import { AUTH_REFRESHED_SEARCH_PARAM, stripAuthRefreshMarker } from "@/server/auth-refresh-redirect"
import { serverPrivateFetch } from "@/server/backend-fetch"
import type { CartResponse } from "@/types/cart/CartResponse"

type CartPageProps = {
  searchParams: Promise<RouteSearchParams>
}

// Tải dữ liệu giỏ hàng trên server và giữ nguyên luồng redirect của Next.
async function getCartInitialData(refreshRedirectPath: string) {
  try {
    const response = await serverPrivateFetch<CartResponse>("/cart/me", {
      refreshRedirectPath,
    })

    return {
      cartData: response.data ?? null,
      errorMessage: response.data ? null : "Khong the tai gio hang.",
    }
  } catch (error) {
    // Giữ redirect() do Next ném ra để luồng refresh auth tiếp tục chạy.
    unstable_rethrow(error)

    return {
      cartData: null,
      errorMessage: getServerFetchErrorMessage(error, "Khong the tai gio hang."),
    }
  }
}

export default async function Page({ searchParams }: CartPageProps) {
  // Next 16 truyền searchParams dạng Promise trong Server Component.
  const params = await searchParams
  // Marker này cho biết request hiện tại vừa quay về từ route refresh auth.
  const hasRefreshMarker = readSearchParam(params[AUTH_REFRESHED_SEARCH_PARAM]) === "1"
  // Đường dẫn để route refresh quay lại đúng page này.
  const refreshRedirectPath = hasRefreshMarker ? `/cart?${AUTH_REFRESHED_SEARCH_PARAM}=1` : "/cart"
  // Dữ liệu giỏ hàng được lấy ở server rồi truyền xuống client component để render/tương tác.
  const { cartData, errorMessage } = await getCartInitialData(refreshRedirectPath)

  // Xóa marker làm mới dùng một lần sau khi dữ liệu tải xong.
  if (cartData && hasRefreshMarker) {
    redirect(stripAuthRefreshMarker(refreshRedirectPath))
  }

  return <CartPageClient cartData={cartData} errorMessage={errorMessage} />
}
