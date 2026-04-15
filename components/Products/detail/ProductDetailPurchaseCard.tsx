"use client"

import { useState } from "react"
import { Heart, ShoppingCart } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import MainButton from "@/components/ui/main-button"
import { ProductDetail } from "@/types/product/productDeteilType"
import { cn } from "@/lib/utils"
import { useAddCartMutation } from "@/features/auth/tokenApi"
import { extractErrorMessage } from "@/lib/error"
import { useNotification } from "@/components/ui/NotificationProvider"

type ProductDetailPurchaseCardProps = {
  product: ProductDetail
}

// hien thi ton kho
function getStockLabel(stock: number) {
  if (stock > 0) return `Con ${stock} san pham`
  return "Het hang"
}

export default function ProductDetailPurchaseCard({
  product,
}: ProductDetailPurchaseCardProps) {

  const { showNotification } = useNotification()
  const status = product.status
  // state so luong muốn mua or thêm cart
  const [quantity, setQuantity] = useState(1)

  // mutation add cart
  const [addCart] = useAddCartMutation()

  // tang so luong (khong vuot qua ton kho)
  const increase = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  // giam so luong (toi thieu = 1)
  const decrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  // goi api them vao gio
  async function handleAddCart() {
    try {
      await addCart({
        productId: product.id,
        quantity: quantity
      }).unwrap()

      showNotification("Them san pham vao gio hang thanh cong", {
        variant: "success"
      })
    } catch (error) {
      const errMsg = extractErrorMessage(error)

      showNotification(errMsg, {
        variant: "error"
      })
    }
  }

  return (
    <Card className="rounded-[28px] border-slate-900 bg-slate-950 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.8)]">
      <CardContent className="space-y-6 p-6 sm:p-8">

        {/* tieu de */}
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
            Ready to order
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            Dat hang nhanh tai MyShop
          </h2>
          <p className="text-sm leading-6 text-slate-300">
            Dat hang ngay nao
          </p>
        </div>

        {/* thong tin nhanh */}
        <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <span>Tinh trang</span>
            <span className="font-semibold text-white">
              {getStockLabel(product.stock)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Ma san pham</span>
            <span className="font-semibold text-white">
              #{product.id}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Danh muc</span>
            <span className="font-semibold text-white">
              Sneakers
            </span>
          </div>
        </div>

        {/* chon so luong */}
        <div className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-sm text-slate-300">So luong</span>

          <div className="flex items-center gap-3">
            {/* nut giam */}
            <button
              onClick={decrease}
              disabled={quantity <= 1}
              className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white disabled:opacity-40"
            >
              -
            </button>

            {/* hien thi so luong */}
            <span className="min-w-6 text-center font-semibold">
              {quantity}
            </span>

            {/* nut tang */}
            <button
              onClick={increase}
              disabled={quantity >= product.stock}
              className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* nut hanh dong */}
        <div className="grid gap-3 sm:grid-cols-2">

          {/* mua ngay */}
          <MainButton
            className={cn(
              "bg-white text-slate-950 hover:bg-slate-100 cursor-pointer",
              status === "INACTIVE" && "opacity-50 pointer-events-none"
            )}
            fullWidth
            size="large"
          >
            <ShoppingCart className="size-4.5" />
            Mua ngay
          </MainButton>

          {/* them gio hang */}
          <MainButton
            onClick={handleAddCart}
            className={cn(
              "border-white/20 text-white hover:bg-white/10 cursor-pointer",
              status === "INACTIVE" && "opacity-50 pointer-events-none"
            )}
            fullWidth
            size="large"
            variant="outline"
          >
            <Heart className="size-4.5" />
            Them gio hang
          </MainButton>
        </div>

      </CardContent>
    </Card>
  )
}