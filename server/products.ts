import "server-only"

import { DEFAULT_PRODUCT_SORT } from "@/lib/products-url"
import { readSearchParam, type RouteSearchParams } from "@/lib/search-params"
import type { ProductCatalogFilters } from "@/types/product/ProductCatalogFilters"

export const PRODUCTS_PAGE_SIZE = 11

export type ProductSearchParams = RouteSearchParams

type ActiveProductsQueryParams = {
  categoryId?: number
  page: number
  size: number
  search?: string
  sort: string
}

function normalizeSort(value: string) {
  const [field = "price", rawDirection = "ASC"] = value.split(",")
  const sortDirection = rawDirection.toUpperCase() === "DESC" ? "DESC" : "ASC"
  const sortField = field.trim() || "price"

  return {
    sort: `${sortField},${sortDirection}`,
    sortDirection,
  } satisfies Pick<ProductCatalogFilters, "sort" | "sortDirection">
}

export function parseProductCatalogFilters(searchParams: ProductSearchParams): ProductCatalogFilters {
  const rawPage = Number.parseInt(readSearchParam(searchParams.page, "1"), 10)
  const rawCategoryId = Number.parseInt(readSearchParam(searchParams.categoryId), 10)
  const search = readSearchParam(searchParams.search).trim()
  const { sort, sortDirection } = normalizeSort(readSearchParam(searchParams.sort, DEFAULT_PRODUCT_SORT))

  return {
    categoryId: Number.isFinite(rawCategoryId) && rawCategoryId > 0 ? rawCategoryId : undefined,
    currentPage: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    search: search || undefined,
    sort,
    sortDirection,
  }
}

function buildActiveProductsSearchParams(params: ActiveProductsQueryParams) {
  const searchParams = new URLSearchParams()

  searchParams.set("page", String(params.page))
  searchParams.set("size", String(params.size))
  searchParams.set("sort", params.sort)

  if (params.categoryId !== undefined) {
    searchParams.set("categoryId", String(params.categoryId))
  }

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim())
  }

  return searchParams
}

export function buildActiveProductsBackendPath(filters: ProductCatalogFilters) {
  const query = buildActiveProductsSearchParams({
    categoryId: filters.categoryId,
    page: Math.max(filters.currentPage - 1, 0),
    size: PRODUCTS_PAGE_SIZE,
    search: filters.search,
    sort: filters.sort,
  })

  return `/products/active?${query}`
}
