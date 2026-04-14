import { BadgeCheck, Boxes, Star, Store, type LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ProductDetail } from "@/types/product/productDeteilType"
import { useState } from "react"

type ProductDetailSummaryProps = {
  product: ProductDetail
}

type SummaryItem ={
      key: string
      icon: LucideIcon
      label: string
      getValue: (product: ProductDetail) => string
    }

// text co dinh
const fixedTags = ["New arrival", "Free ship noi thanh", "Bao hanh doi tra 7 ngay"]

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

function getStockLabel(stock: number) {
  if (stock > 0) {
    return `Con ${stock} san pham`
  }

  return "Het hang"
}

// item tom tat
const summaryItems: SummaryItem[] = [
  {
    key: "brand",
    icon: Store,
    label: "Brand",
    getValue: (product: ProductDetail) => product.nameCategory
  },
  {
    key: "stock",
    icon: Boxes,
    label: "Stock",
    getValue: (product: ProductDetail) => getStockLabel(product.stock),
  },
  {
    key: "status",
    icon: BadgeCheck,
    label: "Status",
    getValue: (product: ProductDetail) => getStatusLabel(product.status),
  },
]

export default function ProductDetailSummary({ product }: ProductDetailSummaryProps) {
  // state show full desc product
  const [expanded, setExpanded] = useState(false)
  return (
    <Card className="rounded-[28px] border-white/70 bg-white/90 backdrop-blur-sm">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
            {product.nameCategory}
          </span>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
            {getStatusLabel(product.status)}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {product.name}
          </h1>

          <p
            className={`max-w-3xl text-base leading-7 text-slate-600
        ${expanded ? "" : "line-clamp-3"}`}
          >
            {product.description}
          </p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-[#0d9488] hover:underline"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2 font-medium text-slate-700">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            4.8/5 (126 reviews)
          </span>
          <span>{product.purchases} da ban</span>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-2xl text-[#EE4D2D] font-semibold md:text-3xl">
              {formatCurrency(product.price)}
            </p>
            <p className="pb-1 text-sm text-slate-500">Da bao gom VAT</p>
          </div>
        </div>

        {/* tag co dinh */}
        <div className="flex flex-wrap gap-2">
          {fixedTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {summaryItems.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.key}
                className="rounded-[14px] border border-slate-200 bg-white p-2"
              >
                <div className="inline-flex rounded-full bg-slate-100 p-2 text-slate-700">
                  <Icon className="size-4" />
                </div>
                <p className="mt-2 text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-1 text-base font-semibold text-slate-950">
                  {item.getValue(product)}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
