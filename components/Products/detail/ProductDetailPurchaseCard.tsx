import { Heart, ShieldCheck, ShoppingCart, Truck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import MainButton from "@/components/ui/main-button"
import { ProductDetail } from "@/types/product/productDeteilType"
import { cn } from "@/lib/utils"

type ProductDetailPurchaseCardProps = {
  product: ProductDetail
}

// text co dinh

// const fixedPolicies = [
//   {
//     title: "Giao hang toan quoc",
//     description: "Ho tro giao nhanh tai noi thanh va dong goi ky truoc khi gui.",
//   },
//   {
//     title: "Doi tra 7 ngay",
//     description: "Nhan doi size neu san pham con nguyen hop va day du phu kien.",
//   },
//   {
//     title: "Cam ket chinh hang",
//     description: "San pham duoc kiem tra ngoai quan va thong tin truoc khi giao.",
//   },
// ]

function getStockLabel(stock: number) {

  if (stock > 0) {
    return `Con ${stock} san pham`
  }

  return "Het hang"
}

export default function ProductDetailPurchaseCard({
  product,
}: ProductDetailPurchaseCardProps) {
  const status = product.status
  return (
    <Card className="rounded-[28px] border-slate-900 bg-slate-950 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.8)]">
      <CardContent className="space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
            Ready to order
          </p>
          <h2 className="text-2xl font-bold tracking-tight">Dat hang nhanh tai MyShop</h2>
          <p className="text-sm leading-6 text-slate-300">
           Đặt hàng ngay nào
          </p>
        </div>

        {/* thong tin nhanh */}
        <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between gap-3">
            <span>Tinh trang</span>
            <span className="font-semibold text-white">{getStockLabel(product.stock)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Ma san pham</span>
            <span className="font-semibold text-white">#{product.id}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Danh muc</span>
            <span className="font-semibold text-white">Sneakers</span>
          </div>
        </div>

        {/* nut hanh dong */}
        <div className="grid gap-3 sm:grid-cols-2">
          <MainButton
            className={cn(
              "bg-white text-slate-950 hover:bg-slate-100 hover:-translate-y-0.5 transition-all duration-300 ease-out",
              status === "INACTIVE" && "opacity-50 cursor-not-allowed  pointer-events-none"
            )}
            fullWidth
            size="large"
          >
            <ShoppingCart className="size-4.5" />
            Mua ngay
          </MainButton>
          <MainButton
            className= {cn(
              "border-white/20 text-white hover:border-white/35 hover:bg-white/10 hover:text-white hover:-translate-y-0.5 transition-all duration-300 ease-out",
              status === "INACTIVE" && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
            fullWidth
            size="large"
            variant="outline"
          >
            <Heart className="size-4.5" />
            Yeu thich
          </MainButton>
        </div>

        {/* chinh sach */}
        {/* <div className="space-y-3">
          {fixedPolicies.map((policy, index) => {
            const Icon = index === 0 ? Truck : ShieldCheck

            return (
              <div
                key={policy.title}
                className="flex gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sky-300">
                  <Icon className="size-4.5" />
                </div>
                <div>
                  <p className="font-semibold text-white">{policy.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {policy.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div> */}
      </CardContent>
    </Card>
  )
}
