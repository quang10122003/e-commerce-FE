import type { CartItemResponse } from "./CartItemResponse"

export type CheckoutCartResponse = {
  items: CartItemResponse[]
  totalQuantity: number
  totalAmount: number
}
