import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { ProductDetail } from "@/types/product/productDeteilType"

type ProductDetailSpecificationsProps = {
  product: ProductDetail
}

function getStatusLabel(status: ProductDetail["status"]) {
  return status === "ACTIVE" ? "Đang mở bán" : "Tạm ngưng"
}

export default function ProductDetailSpecifications({
  product,
}: ProductDetailSpecificationsProps) {
  const specifications = [
    { label: "Danh mục", value: product.nameCategory },
    { label: "Trạng thái", value: getStatusLabel(product.status) },
    { label: "Tồn kho", value: `${product.stock} sản phẩm` },
    { label: "Lượt mua", value: `${product.purchases} đơn` },
    { label: "Giá bán", value: formatCurrency(product.price) },
    { label: "Hình ảnh", value: `${product.url.length + 1} ảnh` },
  ]

  return (
    <Card className="h-fit">
      <CardContent className="space-y-6 p-6 sm:p-7">
        <div className="space-y-2">
          <p className="section-kicker">Specifications</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Thông số tổng quan</h2>
        </div>

        <div className="grid gap-3">
          {specifications.map((item) => (
            <div
              key={item.label}
              className="surface-secondary flex items-center justify-between gap-4 p-4"
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
