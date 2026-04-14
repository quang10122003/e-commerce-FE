"use client"

import ProductCard from "@/components/Products/ProductCard"
import { useGetActiveProductsTopSellingQuery } from "@/features/product/productApi"

export default function TopSellingProducts() {
  const { data } = useGetActiveProductsTopSellingQuery()
  const products = data?.data ?? []

  return (
    <section className="space-y-6 border-t border-slate-200 pt-10">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
          Best seller
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Top sản phẩm bán chạy
        </h2>
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(235px,1fr))]">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </section>
  )
}
