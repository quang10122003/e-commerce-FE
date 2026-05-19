import ProductCatalog from "@/components/Products/ProductCatalog"
import Container from "@/components/shared/Container"
import { buildProductsPageHref } from "@/lib/products-url"
import { serverPublicFetch } from "@/server/backend-fetch"
import { buildActiveProductsBackendPath, parseProductCatalogFilters } from "@/server/products"
import type { ApiResponseType, PagedResponseType } from "@/types/ApiResponse/ApiResponseType"
import type { Category } from "@/types/category/Category"
import type { ProductType } from "@/types/product/ProductsummerType"
import { redirect } from "next/navigation"

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getProductsInitialData(filters: ReturnType<typeof parseProductCatalogFilters>) {
  const [productsResult, categoriesResult] = await Promise.allSettled([
    serverPublicFetch<PagedResponseType<ProductType>>(buildActiveProductsBackendPath(filters)),
    serverPublicFetch<Category[]>("/categories"),
  ])

  return {
    categories: categoriesResult.status === "fulfilled" ? categoriesResult.value.data ?? [] : [],
    productsPage:
      productsResult.status === "fulfilled"
        ? productsResult.value
        : ({
            data: null,
            error: {
              errorCode: "PRODUCTS_FETCH_FAILED",
              message: "Khong the tai danh sach san pham.",
            },
            message: "Khong the tai danh sach san pham.",
            success: false,
            timestamp: new Date().toISOString(),
          } satisfies ApiResponseType<PagedResponseType<ProductType>>),
  }
}

export default async function Page({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const filters = parseProductCatalogFilters(params)
  const { categories, productsPage } = await getProductsInitialData(filters)
  const totalPages = Math.max(productsPage.data?.totalPages ?? 0, 0)

  // Keep the URL canonical when the requested page is beyond the backend result.
  if (totalPages > 0 && filters.currentPage > totalPages) {
    redirect(buildProductsPageHref({ filters, page: totalPages }))
  }

  return (
    <Container>
      <ProductCatalog categories={categories} filters={filters} productsPage={productsPage} />
    </Container>
  )
}
