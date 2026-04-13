"use client"

import { ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import CategoryFilter from "@/components/Products/CategoryFilter"
import Pagination from "@/components/Products/Pagination"
import ProductCard from "@/components/Products/ProductCard"
import Loading from "@/components/shared/Loading"
import { useGetActiveProductsQuery } from "@/features/product/productApi"
import { ProductType } from "@/types/product/ProductType"

export default function ProductCatalog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryIdParam = searchParams.get("categoryId")
  const pageParam = Number(searchParams.get("page"))
  const sortValue = searchParams.get("sort") ?? "price,ASC"
  const sortDirection = sortValue.split(",")[1] ?? "ASC"
  const categoryId =
    categoryIdParam && !Number.isNaN(Number(categoryIdParam))
      ? Number(categoryIdParam)
      : undefined
  const currentPage = !Number.isNaN(pageParam) && pageParam > 0 ? pageParam : 1

  const { data, isLoading } = useGetActiveProductsQuery({
    page: currentPage - 1,
    size: 11,
    sort: sortValue,
    categoryId,
  })
  const productList: ProductType[] = data?.data?.items ?? []
  const totalPages = data?.data?.totalPages ?? 0

  function updateProductFilters(nextParams: URLSearchParams) {
    const nextQuery = nextParams.toString()
    router.push(nextQuery ? `/products?${nextQuery}` : "/products")
  }

  function handleFilterCategory(nextCategoryId?: number) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextCategoryId) {
      params.set("categoryId", String(nextCategoryId))
    } else {
      params.delete("categoryId")
    }

    params.delete("page")
    updateProductFilters(params)
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", `price,${event.currentTarget.value}`)
    params.delete("page")
    updateProductFilters(params)
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString())

    if (page <= 1) {
      params.delete("page")
    } else {
      params.set("page", String(page))
    }

    updateProductFilters(params)
  }

  return (
    <div className="grid gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
      <div className="min-w-0">
        <CategoryFilter
          onSelectCategory={handleFilterCategory}
          selectedCategoryId={categoryId}
        />
      </div>

      <div className="grid gap-5">
        <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Catalog
            </p>
            <h1 className="text-xl font-bold text-slate-950">Sản phẩm đang mở bán</h1>
          </div>

          <select
            onChange={handleSortChange}
            value={sortDirection}
            id="products-filter"
            className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
            aria-label="Lọc theo giá"
          >
            <option value="ASC">Giá thấp → cao</option>
            <option value="DESC">Giá cao → thấp</option>
          </select>
        </div>

        {isLoading ? (
          <Loading />
        ) : productList.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-slate-500">
            Không có sản phẩm
          </div>
        ) : (
              <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {productList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {totalPages > 0 ? (
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPage={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
