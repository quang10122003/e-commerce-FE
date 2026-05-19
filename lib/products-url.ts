export const DEFAULT_PRODUCT_SORT = "price,ASC"

type ProductsUrlFilters = {
  categoryId?: number
  currentPage: number
  sort: string
}

type ProductsPageHrefOptions = {
  filters: ProductsUrlFilters
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

  if (page > 1) {
    params.set("page", String(page))
  }

  const query = params.toString()

  return `/products${query ? `?${query}` : ""}`
}
