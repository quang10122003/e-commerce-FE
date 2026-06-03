import { redirect, unstable_rethrow } from "next/navigation"

import CheckoutPageClient from "@/components/checkout/CheckoutPageClient"
import { getServerFetchErrorMessage } from "@/lib/error"
import { buildInternalPathWithSearchParams } from "@/lib/navigation"
import { readSearchParam, type RouteSearchParams } from "@/lib/search-params"
import { AUTH_REFRESHED_SEARCH_PARAM, stripAuthRefreshMarker } from "@/server/auth-refresh-redirect"
import { serverPrivateFetch } from "@/server/backend-fetch"
import type { CheckoutCartResponse } from "@/types/cart/CheckoutCartResponse"
import type { CheckoutCartTotalRequest } from "@/types/cart/CheckoutCartTotalRequest"

type CheckoutPageProps = {
  searchParams: Promise<RouteSearchParams>
}

/* =====================================================
   Chuyển query items thành request checkout gửi lên backend.
   Format: "productId:quantity,productId:quantity"
   ===================================================== */
function buildCheckoutRequest(selectedItemsQuery: string): CheckoutCartTotalRequest {
  const items = selectedItemsQuery
    .split(",")
    .map((item) => {
      const [productIdValue, quantityValue] = item.split(":")

      const productId = Number.parseInt(productIdValue, 10)
      const quantity = Number.parseInt(quantityValue, 10)

      if (!Number.isFinite(productId) || productId <= 0) {
        return null
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return null
      }

      return {
        productId,
        quantity,
      }
    })
    .filter((item): item is CheckoutCartTotalRequest["items"][number] => Boolean(item))

  return { items }
}

/* =====================================================
   Tải dữ liệu checkout theo danh sách sản phẩm user đã chọn.
   ===================================================== */
async function getCheckoutInitialData(
  checkoutRequest: CheckoutCartTotalRequest,
  refreshRedirectPath: string
) {
  if (checkoutRequest.items.length === 0) {
    return {
      checkoutData: null,
      errorMessage: null,
    }
  }

  try {
    const response = await serverPrivateFetch<CheckoutCartResponse>(
      "/cart/checkout",
      {
        body: checkoutRequest,
        method: "POST",
        refreshRedirectPath,
      }
    )

    return {
      checkoutData: response.data ?? null,
      errorMessage: response.data
        ? null
        : "Khong the tai du lieu checkout.",
    }
  } catch (error) {
    // Giữ redirect() do Next ném ra để luồng refresh auth tiếp tục chạy.
    unstable_rethrow(error)

    return {
      checkoutData: null,
      errorMessage: getServerFetchErrorMessage(
        error,
        "Khong the tai du lieu checkout."
      ),
    }
  }
}

export default async function Page({ searchParams }: CheckoutPageProps) {
  // Next 16 truyền searchParams dạng Promise trong Server Component.
  const params = await searchParams

  // Marker này cho biết request hiện tại vừa quay về từ route refresh auth.
  const hasRefreshMarker =
    readSearchParam(params[AUTH_REFRESHED_SEARCH_PARAM]) === "1"

  // Đường dẫn refresh giữ nguyên query sản phẩm đã chọn khi cần làm mới auth.
  const refreshRedirectPath =
    buildInternalPathWithSearchParams("/checkout", params)

  // Query items lưu danh sách productId:số lượng được chọn từ trang giỏ hàng.
  const selectedItemsQuery = readSearchParam(params.items)

  // Build request checkout từ query string.
  const checkoutRequest = buildCheckoutRequest(selectedItemsQuery)

  // Dữ liệu checkout được lấy ở server rồi truyền xuống client component checkout.
  const { checkoutData, errorMessage } =
    await getCheckoutInitialData(checkoutRequest, refreshRedirectPath)

  // Xóa marker làm mới dùng một lần sau khi dữ liệu tải xong.
  if (checkoutData && hasRefreshMarker) {
    redirect(stripAuthRefreshMarker(refreshRedirectPath))
  }

  return (
    <CheckoutPageClient
      checkoutData={checkoutData}
      errorMessage={errorMessage}
    />
  )
}