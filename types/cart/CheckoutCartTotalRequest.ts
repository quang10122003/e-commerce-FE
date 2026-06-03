export type CheckoutCartTotalItem = {
  productId: number
  quantity: number
}

export type CheckoutCartTotalRequest = {
  items: CheckoutCartTotalItem[]
}
