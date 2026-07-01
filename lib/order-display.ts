import type { OrderResponse } from "@/types/order/OrderResponse"

export function getOrderStatusMeta(status: OrderResponse["status"]) {
  switch (status) {
    case "PENDING":
      return {
        className: "bg-warning-soft text-[#9a6700]",
        label: "Chờ xác nhận",
      }
    case "CONFIRMED":
      return {
        className: "bg-primary-soft text-primary", 
        label: "Đã xác nhận",
      }
    case "SHIPPING":
      return {
        className: "bg-primary-soft text-primary",
        label: "Đang vận chuyển",
      }
    case "COMPLETED":
      return {
        className: "bg-success-soft text-[#166534]",
        label: "Hoàn thành",
      }
    case "CANCELLED":
      return {
        className: "bg-danger-soft text-[#b42318]",
        label: "Đã hủy",
      }
  }
}
