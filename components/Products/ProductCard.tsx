import styles from "@/styles/ProductCard.module.css"
import { ProductType } from "@/types/product/ProductType"

type ProductCardProps = {
  product: ProductType
}

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN")
}

export default function ProductCard({ product }: ProductCardProps) {
  const descriptionText = product.description ?? "Mô tả đang được cập nhật"

  return (
    <article className={styles["product-card"]}>
      <div className={styles["product-card__thumbnail-wrap"]}>
        <img
          className={styles["product-card__thumbnail"]}
          src={product.thumbnail}
          alt={product.name}
          loading="lazy"
        />
      </div>

      <div className={styles["product-card__body"]}>
        <h2 className={styles["product-card__name"]}>
          {product.name}
        </h2>

        <p className={styles["product-card__description"]}>
          {descriptionText}
        </p>

        <p className={styles["product-card__price"]}>
          {formatCurrency(product.price)} VND
        </p>
      </div>
    </article>
  )
}
