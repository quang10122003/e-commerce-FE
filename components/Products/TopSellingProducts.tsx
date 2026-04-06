"use client"

import { useGetActiveProductsTopSellingQuery } from "@/features/product/productApi"
import ProductCard from "./ProductCard"
import styles from "@/styles/TopSellingProducts.module.css"

export default function TopSellingProducts() {
    const { data } = useGetActiveProductsTopSellingQuery()
    const products = data?.data ?? []

    return (
        <section className={styles.listProductTopSelling}>
            <h1>Top sản phẩm bán chạy</h1>

            <div className={styles.listProductTopSelling__content}>
                {products.map((product) => (
                    <ProductCard product={product} key={product.id} />
                ))}
            </div>
        </section>
    )
}
