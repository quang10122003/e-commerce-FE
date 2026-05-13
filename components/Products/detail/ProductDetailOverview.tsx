import { Sparkles } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { ProductDetail } from "@/types/product/productDeteilType"

type ProductDetailOverviewProps = {
  product: ProductDetail
}

const fixedFeatures = [
  "Chất liệu và hoàn thiện được tối ưu cho nhu cầu sử dụng hằng ngày.",
  "Tổng thể thiết kế gọn gàng, dễ phối và phù hợp nhiều bối cảnh sử dụng.",
  "Thông tin sản phẩm hiển thị rõ ràng, dễ quét và ít chi tiết gây nhiễu.",
  "Cấu trúc nội dung ưu tiên những gì người mua cần thấy đầu tiên.",
]

export default function ProductDetailOverview({ product }: ProductDetailOverviewProps) {
  return (
    <Card>
      <CardContent className="space-y-6 p-6 sm:p-7">
        <div className="space-y-2">
          <p className="section-kicker">Overview</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Thông tin nổi bật của sản phẩm
          </h2>
        </div>

        <p className="text-[15px] leading-8 text-slate-600">{product.description}</p>

        <div className="grid gap-3">
          {fixedFeatures.map((feature) => (
            <div
              key={feature}
              className="surface-secondary flex gap-3 p-4"
            >
              <div className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-primary">
                <Sparkles className="size-4.5" />
              </div>
              <p className="text-sm leading-7 text-slate-600">{feature}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
