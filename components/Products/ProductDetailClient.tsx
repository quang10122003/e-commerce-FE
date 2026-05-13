"use client"

import ProductDetailBreadcrumb from "@/components/Products/detail/ProductDetailBreadcrumb"
import ProductDetailGallery from "@/components/Products/detail/ProductDetailGallery"
import ProductDetailOverview from "@/components/Products/detail/ProductDetailOverview"
import ProductDetailPurchaseCard from "@/components/Products/detail/ProductDetailPurchaseCard"
import ProductDetailSpecifications from "@/components/Products/detail/ProductDetailSpecifications"
import ProductDetailSummary from "@/components/Products/detail/ProductDetailSummary"
import Container from "@/components/shared/Container"
import Loading from "@/components/shared/Loading"
import { useGetProductByIdQuery } from "@/features/product/productApi"
import { ProductDetail } from "@/types/product/productDeteilType"

type ProductDetailClientProps = {
  id: number
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const { data, isLoading } = useGetProductByIdQuery(id)

  if (isLoading) {
    return (
      <Container className="py-8 sm:py-10">
        <Loading />
      </Container>
    )
  }

  if (!data?.data) return null

  const productdata: ProductDetail = data.data
  const listImage: string[] = [productdata.thumbnail, ...productdata.url]

  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <div className="space-y-6">
        <ProductDetailBreadcrumb
          categoryName={productdata.nameCategory}
          productName={productdata.name}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:items-start">
          <ProductDetailGallery images={listImage} />

          <div className="grid gap-6">
            <ProductDetailSummary product={productdata} />
            <ProductDetailPurchaseCard product={productdata} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <ProductDetailOverview product={productdata} />
          <ProductDetailSpecifications product={productdata} />
        </div>
      </div>
    </Container>
  )
}
