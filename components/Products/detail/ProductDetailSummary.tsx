"use client"

import { useState } from "react"
import { BadgeCheck, Boxes, Star, Store, type LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ProductDetail } from "@/types/product/productDeteilType"

type ProductDetailSummaryProps = {
  product: ProductDetail
}

type SummaryItem = {
  key: string
  icon: LucideIcon
  label: string
  getValue: (product: ProductDetail) => string
}

const fixedTags = ["New arrival", "Free ship nội thành", "Đổi trả trong 7 ngày"]

function getStatusLabel(status: ProductDetail["status"]) {
  return status === "ACTIVE" ? "Đang mở bán" : "Tạm ngưng"
}

function getStockLabel(stock: number) {
  if (stock > 0) {
    return `Còn ${stock} sản phẩm`
  }

  return "Hết hàng"
}

const summaryItems: SummaryItem[] = [
  {
    key: "brand",
    icon: Store,
    label: "Danh mục",
    getValue: (product: ProductDetail) => product.nameCategory,
  },
  {
    key: "stock",
    icon: Boxes,
    label: "Tồn kho",
    getValue: (product: ProductDetail) => getStockLabel(product.stock),
  },
  {
    key: "status",
    icon: BadgeCheck,
    label: "Trạng thái",
    getValue: (product: ProductDetail) => getStatusLabel(product.status),
  },
]

export default function ProductDetailSummary({ product }: ProductDetailSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardContent className="space-y-6 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {product.nameCategory}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
            {getStatusLabel(product.status)}
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950 sm:text-[36px]">
            {product.name}
          </h1>

          <p
            className={cn(
              "max-w-3xl text-[15px] leading-8 text-slate-600",
              !expanded && "line-clamp-3"
            )}
          >
            {product.description}
          </p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-semibold text-primary hover:brightness-110"
            type="button"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2 font-medium text-slate-700">
            <Star className="size-4 fill-[#f59e0b] text-[#f59e0b]" />
            4.8/5 (126 reviews)
          </span>
          <span>{product.purchases} lượt mua</span>
        </div>

        <div className="surface-secondary px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Giá bán hiện tại
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-[30px] font-bold tracking-tight text-slate-950">
              {formatCurrency(product.price)}
            </p>
            <p className="text-sm text-slate-500">Đã bao gồm VAT</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {fixedTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {summaryItems.map((item) => {
            const Icon = item.icon

            return (
              <div key={item.key} className="surface-secondary p-4">
                <div className="inline-flex rounded-[12px] bg-white p-2 text-primary">
                  <Icon className="size-4" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-500">{item.label}</p>
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
