"use client"

import { ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import CategoryFilter from "@/components/Products/CategoryFilter"
import Pagination from "@/components/Products/Pagination"
import ProductCard from "@/components/Products/ProductCard"
import Loading from "@/components/shared/Loading"
import { useGetActiveProductsQuery } from "@/features/product/productApi"
import { ProductType } from "@/types/product/ProductsummerType"

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
    <section className="py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0">
          <CategoryFilter
            onSelectCategory={handleFilterCategory}
            selectedCategoryId={categoryId}
          />
        </div>

        <div className="surface-primary grid gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="section-kicker">Catalog</p>
              <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
                Sản phẩm đang mở bán
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                Giao diện danh sách được tối ưu cho việc quét nhanh hình ảnh, giá và trạng thái
                mà không gây nặng mắt.
              </p>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-600">
              Sắp xếp theo giá
              <select
                onChange={handleSortChange}
                value={sortDirection}
                id="products-filter"
                className="h-11 rounded-[12px] border border-border bg-white px-4 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-ring"
                aria-label="Lọc theo giá"
              >
                <option value="ASC">Giá thấp đến cao</option>
                <option value="DESC">Giá cao đến thấp</option>
              </select>
            </label>
          </div>

          {isLoading ? (
            <Loading />
          ) : productList.length === 0 ? (
            <div className="surface-secondary px-6 py-16 text-center text-slate-500">
              Không có sản phẩm phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(235px,1fr))]">
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
    </section>
  )
}
