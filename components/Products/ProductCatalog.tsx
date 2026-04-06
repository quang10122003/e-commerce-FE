"use client"

import { ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useGetActiveProductsQuery } from "@/features/product/productApi"
import { ProductType } from "@/types/product/ProductType"
import Loading from "../Loading"
import CategoryFilter from "./CategoryFilter"
import ProductCard from "./ProductCard"
import styles from "../../styles/Products.module.css"

export default function ProductCatalog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryIdParam = searchParams.get("categoryId")
  const sortValue = searchParams.get("sort") ?? "price,ASC"
  // Query string luu du lieu dang "field,direction", nen tach rieng direction de bind vao select.
  const sortDirection = sortValue.split(",")[1] ?? "ASC"
  const categoryId = categoryIdParam && !Number.isNaN(Number(categoryIdParam))
    ? Number(categoryIdParam)
    : undefined

  const { data, isLoading } = useGetActiveProductsQuery({
    page: 0,
    size: 20,
    sort: sortValue,
    categoryId,
  })
  const productList: ProductType[] = data?.data?.items ?? []

  function updateProductFilters(nextParams: URLSearchParams) {
    // Router la source of truth cho bo loc, nen moi thao tac deu duoc day nguoc len URL.
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

    updateProductFilters(params)
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", `price,${event.currentTarget.value}`)

    updateProductFilters(params)
  }

  return (
    <div className={styles.products}>
      <div className={styles.products__category}>
        <CategoryFilter
          onSelectCategory={handleFilterCategory}
          selectedCategoryId={categoryId}
        />
      </div>

      <div className={styles.products__cards}>
        <div className={styles.products__filterBar}>
          <select
            onChange={handleSortChange}
            value={sortDirection}
            id="products-filter"
            className={styles.products__filterSelect}
            aria-label="Lọc theo giá"
          >
            <option value="ASC">Giá thấp &rarr; cao</option>
            <option value="DESC">Giá cao &rarr; thấp</option>
          </select>
        </div>

        {isLoading ? (
          <Loading />
        ) : productList.length === 0 ? (
          <span>Không có sản phẩm</span>
        ) : (
          <div className={styles.products__cardsGrid}>
            {productList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
