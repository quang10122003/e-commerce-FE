import ProductDetailClient from "@/components/Products/ProductDetailClient"
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <ProductDetailClient id ={Number(id)}/>
  )
}
