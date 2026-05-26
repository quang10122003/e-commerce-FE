import { redirect, unstable_rethrow } from "next/navigation"

import OrderClient from "@/components/order/OrderClient"
import { getServerFetchErrorMessage } from "@/lib/error"
import { buildInternalPathWithSearchParams } from "@/lib/navigation"
import { parseSelectedOrderStatus } from "@/lib/order-url"
import { readSearchParam } from "@/lib/search-params"
import { AUTH_REFRESHED_SEARCH_PARAM, stripAuthRefreshMarker } from "@/server/auth-refresh-redirect"
import { serverPrivateFetch } from "@/server/backend-fetch"
import type { RouteSearchParams } from "@/lib/search-params"
import type { OrderResponse } from "@/types/order/OrderResponse"

type OrderPageProps = {
  searchParams: Promise<RouteSearchParams>
}

// Tải dữ liệu đơn hàng trên server và giữ nguyên luồng redirect của Next.
async function getOrderInitialData(refreshRedirectPath: string) {
  try {
    const response = await serverPrivateFetch<OrderResponse[]>("/orders/me", {
      refreshRedirectPath,
    })

    return {
      errorMessage: response.data ? null : "Khong the tai don hang.",
      orders: response.data ?? [],
    }
  } catch (error) {
    // Giữ redirect() do Next ném ra để luồng refresh auth tiếp tục chạy.
    unstable_rethrow(error)

    return {
      errorMessage: getServerFetchErrorMessage(error, "Khong the tai don hang."),
      orders: [],
    }
  }
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  // Next 16 truyền searchParams dạng Promise trong Server Component.
  const params = await searchParams
  // Query status chỉ ảnh hưởng UI lọc đơn hàng phía client.
  const selectedStatus = parseSelectedOrderStatus(params)
  // Ghi nhớ URL hiện tại để refresh auth quay lại đúng bộ lọc đang xem.
  const refreshRedirectPath = buildInternalPathWithSearchParams("/order", params)
  // Marker này cho biết request hiện tại vừa quay về từ route refresh auth.
  const hasRefreshMarker = readSearchParam(params[AUTH_REFRESHED_SEARCH_PARAM]) === "1"
  // Dữ liệu đơn hàng được lấy ở server rồi truyền xuống client component để render/tương tác.
  const { errorMessage, orders } = await getOrderInitialData(refreshRedirectPath)

  // Refresh auth thành công thì xóa marker khỏi URL.
  if (!errorMessage && hasRefreshMarker) {
    redirect(stripAuthRefreshMarker(refreshRedirectPath))
  }

  return (
    <OrderClient
      errorMessage={errorMessage}
      orders={orders}
      selectedStatus={selectedStatus}
    />
  )
}
