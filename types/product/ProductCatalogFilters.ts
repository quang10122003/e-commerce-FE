export type ProductCatalogFilters = {
  categoryId?: number
  currentPage: number
  search?: string
  sort: string
  sortDirection: "ASC" | "DESC"
}
