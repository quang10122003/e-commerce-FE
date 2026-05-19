import "server-only"

import { DEFAULT_PRODUCT_SORT } from "@/lib/products-url"
import type { ProductCatalogFilters } from "@/types/product/ProductCatalogFilters"

export const PRODUCTS_PAGE_SIZE = 11

export type ProductSearchParams = Record<string, string | string[] | undefined>

type ActiveProductsQueryParams = {
  categoryId?: number
  page: number
  size: number
  sort: string
}

function readSearchParam(value: string | string[] | undefined, fallback = "") {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback
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
  const { sort, sortDirection } = normalizeSort(readSearchParam(searchParams.sort, DEFAULT_PRODUCT_SORT))

  return {
    categoryId: Number.isFinite(rawCategoryId) && rawCategoryId > 0 ? rawCategoryId : undefined,
    currentPage: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
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

  return searchParams
}

export function buildActiveProductsBackendPath(filters: ProductCatalogFilters) {
  const query = buildActiveProductsSearchParams({
    categoryId: filters.categoryId,
    page: Math.max(filters.currentPage - 1, 0),
    size: PRODUCTS_PAGE_SIZE,
    sort: filters.sort,
  })

  return `/products/active?${query}`
}
