import { Card, CardContent } from "@/components/ui/card"
import { ProductType } from "@/types/product/ProductType"
import Link from "next/link"

type ProductCardProps = {
  product: ProductType
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ProductCard({ product }: ProductCardProps) {
  const descriptionText = product.description ?? "Mô tả đang được cập nhật."

  return (
    <Link href={`products/${product.id}`}>
      <Card className="group flex min-h-107 flex-col overflow-hidden rounded-[10px] border-slate-200/80 transition-transform duration-300 hover:-translate-y-1 sm:min-h-0">
        <div className="aspect-[4/4.8] overflow-hidden bg-slate-100 sm:aspect-4/3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
          />
        </div>

        <CardContent className="grid flex-1 gap-3 p-5">
          <h2 className="line-clamp-2 text-lg font-bold leading-7 text-slate-950">
            {product.name}
          </h2>
          <p className="line-clamp-3 text-sm leading-6 text-slate-500">{descriptionText}</p>
          <p className="text-base font-bold text-sky-700">{formatCurrency(product.price)}</p>
        </CardContent>
      </Card>
    </Link>
    
  )
}
