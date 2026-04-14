import { Sparkles } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { ProductDetail } from "@/types/product/productDeteilType"

type ProductDetailOverviewProps = {
  product: ProductDetail
}

// text co dinh
const fixedFeatures = [
  "Upper mesh thoang khi, giu form tot cho nhung ngay di chuyen nhieu.",
  "De giay dem hoi giup cam giac em chan va on dinh hon khi mang ca ngay.",
  "Tong the mau sac trung tinh, de ket hop voi jeans, kaki hoac do the thao.",
  "Thiet ke hien dai nhung van de ung dung, hop voi nguoi tre va phong cach thanh thi.",
]

export default function ProductDetailOverview({ product }: ProductDetailOverviewProps) {
  return (
    <Card className="rounded-[28px] border border-white/60 bg-white/90 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
            Overview
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Thong tin noi bat cua san pham
          </h2>
        </div>

        <p className="text-base leading-8 text-slate-600">{product.description}</p>

        {/* list mo ta */}
        <div className="grid gap-3">
          {fixedFeatures.map((feature) => (
            <div
              key={feature}
              className="flex gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <div className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
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
