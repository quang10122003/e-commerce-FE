import ProductDetailClient from "@/components/Products/ProductDetailClient"
import { serverPublicFetch } from "@/server/backend-fetch"
import { ProductDetail } from "@/types/product/productDeteilType"
import { notFound } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productId = Number(id)

  if (!Number.isFinite(productId) || productId <= 0) {
    notFound()
  }

  const response = await serverPublicFetch<ProductDetail>(`/products/${productId}`).catch(() => null)

  if (!response?.data) {
    notFound()
  }

  return (
    <ProductDetailClient product={response.data} />
  )
}
