export const DEFAULT_PRODUCT_SORT = "price,ASC"

type ProductsUrlFilters = {
  categoryId?: number
  currentPage: number
  search?: string
  sort: string
}

type ProductsPageHrefOptions = {
  filters: ProductsUrlFilters
  page?: number
}

type ProductsPageHrefPatch = Partial<Pick<ProductsUrlFilters, "categoryId" | "search" | "sort">> & {
  page?: number
}

export function buildProductsPageHref({
  filters,
  page = filters.currentPage,
}: ProductsPageHrefOptions) {
  const params = new URLSearchParams()

  if (filters.categoryId !== undefined) {
    params.set("categoryId", String(filters.categoryId))
  }

  if (filters.sort !== DEFAULT_PRODUCT_SORT) {
    params.set("sort", filters.sort)
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim())
  }

  if (page > 1) {
    params.set("page", String(page))
  }

  const query = params.toString()

  return `/products${query ? `?${query}` : ""}`
}

export function buildProductsPageHrefWithPatch(filters: ProductsUrlFilters, patch: ProductsPageHrefPatch) {
  const hasCategoryPatch = Object.prototype.hasOwnProperty.call(patch, "categoryId")

  return buildProductsPageHref({
    filters: {
      ...filters,
      categoryId: hasCategoryPatch ? patch.categoryId : filters.categoryId,
      search: patch.search ?? filters.search,
      sort: patch.sort ?? filters.sort,
    },
    page: patch.page ?? filters.currentPage,
  })
}
