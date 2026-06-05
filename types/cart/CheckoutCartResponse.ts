import type { CartItemResponse } from "./CartItemResponse"
import type { MoneyValue } from "@/types/money/MoneyValue"

export type CheckoutCartResponse = {
  items: CartItemResponse[]
  totalQuantity: number
  totalAmount: MoneyValue
}
