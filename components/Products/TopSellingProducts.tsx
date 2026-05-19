import ProductCard from "@/components/Products/ProductCard"
import type { ProductType } from "@/types/product/ProductsummerType"

type TopSellingProductsProps = {
  products: ProductType[]
}

export default function TopSellingProducts({ products }: TopSellingProductsProps) {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="section-kicker">Best seller</p>
        <h2 className="section-title">Top sản phẩm bán chạy</h2>
        <p className="section-copy max-w-2xl">
          Danh sách được trình bày với mật độ gọn vừa đủ, ưu tiên ảnh, tên và giá theo đúng thứ
          tự chú ý.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(235px,1fr))]">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </section>
  )
}
