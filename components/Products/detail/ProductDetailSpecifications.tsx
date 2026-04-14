import { Card, CardContent } from "@/components/ui/card"
import { ProductDetail } from "@/types/product/productDeteilType"

type ProductDetailSpecificationsProps = {
  product: ProductDetail
}

// format gia
function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function getStatusLabel(status: ProductDetail["status"]) {
  return status === "ACTIVE" ? "Dang mo ban" : "Tam ngung"
}

export default function ProductDetailSpecifications({
  product,
}: ProductDetailSpecificationsProps) {
  // thong so co dinh
  const specifications = [
    { label: "Category", value: product.nameCategory },
    { label: "Brand", value: product.nameCategory },
    { label: "Status", value: getStatusLabel(product.status) },
    { label: "Stock", value: `${product.stock} san pham` },
    { label: "Purchases", value: `${product.purchases} order` },
    { label: "Price", value: formatCurrency(product.price) },
    { label: "Gallery", value: `${product.url.length} image` },
  ]

  return (
    <Card className="rounded-[28px] border-white/70 bg-white/90 backdrop-blur-sm  shadow-[0_10px_30px_rgba(0,0,0,0.08)] h-fit">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
            Specifications
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Thong so tong quan
          </h2>
        </div>

        <div className="grid gap-3">
          {specifications.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-white px-4 py-4"
            >
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="text-right text-sm font-semibold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
