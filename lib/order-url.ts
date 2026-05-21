import { readSearchParam, type RouteSearchParams } from "@/lib/search-params"
import type { OrderStatus } from "@/types/order/OrderResponse"

const VALID_ORDER_STATUS = new Set<OrderStatus>(["PENDING", "SHIPPING", "COMPLETED", "CANCELLED"])

export function buildOrderStatusHref(status: string) {
  if (status === "All") {
    return "/order"
  }

  const params = new URLSearchParams()
  params.set("status", status)

  return `/order?${params}`
}

export function parseSelectedOrderStatus(params: RouteSearchParams) {
  const status = readSearchParam(params.status)

  return status && VALID_ORDER_STATUS.has(status as OrderStatus) ? status : "All"
}
