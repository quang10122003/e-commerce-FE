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

type ProductsPageHrefPatch = Partial<Pick<ProductsUrlFilters, "categoryId" | "sort">> & {
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

export function buildProductsPageHrefWithPatch(filters: ProductsUrlFilters, patch: ProductsPageHrefPatch) {
  const hasCategoryPatch = Object.prototype.hasOwnProperty.call(patch, "categoryId")

  return buildProductsPageHref({
    filters: {
      ...filters,
      categoryId: hasCategoryPatch ? patch.categoryId : filters.categoryId,
      sort: patch.sort ?? filters.sort,
    },
    page: patch.page ?? filters.currentPage,
  })
}
