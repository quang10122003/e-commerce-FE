import HomeSections from "@/components/home"
import { serverPublicFetch } from "@/server/backend-fetch"
import type { Category } from "@/types/category/Category"
import type { ProductType } from "@/types/product/ProductsummerType"

async function getHomeInitialData() {
  const [categoriesResult, topProductsResult] = await Promise.allSettled([
    serverPublicFetch<Category[]>("/categories"),
    serverPublicFetch<ProductType[]>("/products/topSelling"),
  ])

  return {
    categories: categoriesResult.status === "fulfilled" ? categoriesResult.value.data ?? [] : [],
    topSellingProducts: topProductsResult.status === "fulfilled" ? topProductsResult.value.data ?? [] : [],
  }
}

export default async function Home() {
  const initialData = await getHomeInitialData()

  return <HomeSections {...initialData} />
}
