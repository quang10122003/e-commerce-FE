import Link from "next/link"
import { Category } from "@/types/category/Category"
import styles from "@/styles/CategoryCard.module.css"

type CategoryCardProps = {
    category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link href={`/products?categoryId=${category.id}`} className={styles.categoryCard}>
            <div className={styles.categoryCard__imageWrap}>
                <img src={category.image} alt={category.name} className={styles.categoryCard__image} />
            </div>
            <p className={styles.categoryCard__name}>{category.name}</p>
        </Link>
    )
}
