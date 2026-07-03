"use client"

import { ChangeEvent, useTransition } from "react"
import { useRouter } from "next/navigation"

import CategoryFilter from "@/components/Products/CategoryFilter"
import Pagination from "@/components/Products/Pagination"
import ProductCard from "@/components/Products/ProductCard"
import Loading from "@/components/shared/Loading"
import { buildProductsPageHrefWithPatch } from "@/lib/products-url"
import type { ApiResponseType, PagedResponseType } from "@/types/ApiResponse/ApiResponseType"
import type { Category } from "@/types/category/Category"
import type { ProductCatalogFilters } from "@/types/product/ProductCatalogFilters"
import { ProductType } from "@/types/product/ProductsummerType"

type ProductCatalogProps = {
  categories: Category[]
  filters: ProductCatalogFilters
  productsPage: ApiResponseType<PagedResponseType<ProductType>>
}

export default function ProductCatalog({ categories, filters, productsPage }: ProductCatalogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const productList: ProductType[] = productsPage.data?.items ?? []
  const totalPages = productsPage.data?.totalPages ?? 0
  // Flag khi backend trả lỗi để giữ layout và show placeholder.
  const isErrorState = !productsPage.success
  // Render skeleton nếu backend lỗi và chưa có danh sách sản phẩm.
  const shouldRenderSkeleton = isErrorState && productList.length === 0

  function updateProductFilters(href: string) {
    startTransition(() => {
      router.push(href)
    })
  }

  function handleFilterCategory(nextCategoryId?: number) {
    updateProductFilters(
      buildProductsPageHrefWithPatch(filters, {
        categoryId: nextCategoryId,
        page: 1,
      })
    )
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    updateProductFilters(
      buildProductsPageHrefWithPatch(filters, {
        page: 1,
        sort: `price,${event.currentTarget.value}`,
      })
    )
  }

  function handlePageChange(page: number) {
    updateProductFilters(buildProductsPageHrefWithPatch(filters, { page }))
  }

  // Hiển thị placeholder sản phẩm dạng skeleton khi backend lỗi.
  function renderProductSkeletons() {
    return (
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(235px,1fr))] opacity-90">
        {Array.from({ length: 6 }, (_, index) => (
          <article
            key={index}
            className="rounded-[10px] border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="aspect-[4/4.8] rounded-[10px] bg-slate-200/80 animate-pulse" />
            <div className="mt-4 space-y-3">
              <div className="h-4 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="h-3 w-4/6 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="h-3 w-3/5 rounded-full bg-slate-200/80 animate-pulse" />
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="h-8 w-20 rounded-full bg-slate-200/80 animate-pulse" />
                <div className="h-8 w-24 rounded-full bg-slate-200/80 animate-pulse" />
              </div>
            </div>
          </article>
        ))}
      </div>
    )
  }

  // Chọn nội dung phù hợp: skeleton, empty state hoặc danh sách sản phẩm.
  function renderProductList() {
    if (shouldRenderSkeleton) {
      return renderProductSkeletons()
    }

    if (productList.length === 0) {
      return (
        <div className="surface-secondary px-6 py-16 text-center text-slate-500">
          Không có sản phẩm phù hợp với bộ lọc hiện tại.
        </div>
      )
    }

    return (
      <div className={shouldRenderSkeleton ? "grid gap-4 grid-cols-[repeat(auto-fit,minmax(235px,1fr))] opacity-60" : "grid gap-4 grid-cols-[repeat(auto-fit,minmax(235px,1fr))]"}>
        {productList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    )
  }

  // Thông báo nhỏ khi fetch sản phẩm gặp lỗi nhưng vẫn giữ layout.
  return (
    <section className="py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0">
          <CategoryFilter
            categories={categories}
            onSelectCategory={handleFilterCategory}
            selectedCategoryId={filters.categoryId}
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
                value={filters.sortDirection}
                id="products-filter"
                className="h-11 rounded-[12px] border border-border bg-white px-4 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-ring"
                aria-label="Lọc theo giá"
              >
                <option value="ASC">Giá thấp đến cao</option>
                <option value="DESC">Giá cao đến thấp</option>
              </select>
            </label>
          </div>

          {isPending ? (
            <Loading />
          ) : (
            renderProductList()
          )}

          {totalPages > 0 ? (
            <div className="pt-2">
              <Pagination
                currentPage={filters.currentPage}
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
