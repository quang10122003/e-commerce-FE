import CartPageClient from "@/components/cart/CartPageClient"
import { serverPrivateFetch } from "@/server/backend-fetch"
import type { CartResponse } from "@/types/cart/CartResponse"

async function getCartInitialData() {
  const response = await serverPrivateFetch<CartResponse>("/cart/me").catch(() => null)

  return {
    cartData: response?.data ?? null,
    errorMessage: response?.data ? null : "Khong the tai gio hang.",
  }
}

export default async function Page() {
  const { cartData, errorMessage } = await getCartInitialData()

  return <CartPageClient cartData={cartData} errorMessage={errorMessage} />
}
