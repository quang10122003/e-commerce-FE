import type { MoneyValue } from "@/types/money/MoneyValue"

// Chuyển giá trị tiền từ API về số để format hoặc tính toán tạm trên UI.
export function toMoneyNumber(value: MoneyValue | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return 0
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  const normalizedValue = Number(value)

  return Number.isFinite(normalizedValue) ? normalizedValue : 0
}

// Tính tiền theo số lượng từ giá BigDecimal server trả về.
export function multiplyMoney(value: MoneyValue | null | undefined, quantity: number) {
  return Number((toMoneyNumber(value) * quantity).toFixed(0))
}

// Định dạng tiền theo VND dạng số nguyên giống cấu hình DECIMAL(12) trên server.
export function formatCurrency(value: MoneyValue | null | undefined) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(toMoneyNumber(value))
}

// Định dạng ngày theo locale tiếng Việt.
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

// Định dạng ngày giờ theo locale tiếng Việt.
export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}
