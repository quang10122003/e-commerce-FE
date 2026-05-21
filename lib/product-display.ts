import type { ProductDetail } from "@/types/product/productDeteilType"

export function getProductInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function getProductStatusLabel(status: ProductDetail["status"]) {
  return status === "ACTIVE" ? "Đang mở bán" : "Tạm ngưng"
}

export function getProductStockLabel(stock: number) {
  if (stock > 0) {
    return `Còn ${stock} sản phẩm`
  }

  return "Hết hàng"
}
