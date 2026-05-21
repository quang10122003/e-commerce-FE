"use client"

import { useState } from "react"
import { Heart, ShoppingCart } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import MainButton from "@/components/ui/main-button"
import { useNotification } from "@/components/ui/NotificationProvider"
import { useAddCartMutation } from "@/client/api/backend-api"
import { extractErrorMessage } from "@/lib/error"
import { cn } from "@/lib/cn"
import { getProductStockLabel } from "@/lib/product-display"
import { ProductDetail } from "@/types/product/productDeteilType"

type ProductDetailPurchaseCardProps = {
  product: ProductDetail
}

export default function ProductDetailPurchaseCard({
  product,
}: ProductDetailPurchaseCardProps) {
  const { showNotification } = useNotification()
  const [quantity, setQuantity] = useState(1)
  const [addCart] = useAddCartMutation()
  const status = product.status

  const increase = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  async function handleAddCart() {
    try {
      await addCart({
        productId: product.id,
        quantity,
      }).unwrap()

      showNotification("Thêm sản phẩm vào giỏ hàng thành công", {
        variant: "success",
      })
    } catch (error) {
      const errMsg = extractErrorMessage(error)

      showNotification(errMsg, {
        variant: "error",
      })
    }
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6 sm:p-7">
        <div className="space-y-2">
          <p className="section-kicker">Ready to order</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Đặt hàng nhanh tại MyShop
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            Mọi hành động mua hàng được gom trong một surface riêng, sáng rõ và dễ thao tác.
          </p>
        </div>

        <div className="surface-secondary grid gap-3 p-4 text-sm text-slate-600">
          <div className="flex items-center justify-between gap-4">
            <span>Tình trạng</span>
            <span className="font-semibold text-slate-950">{getProductStockLabel(product.stock)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Mã sản phẩm</span>
            <span className="font-semibold font-mono text-slate-950">#{product.id}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Danh mục</span>
            <span className="font-semibold text-slate-950">{product.nameCategory}</span>
          </div>
        </div>

        <div className="rounded-[12px] border border-border bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-600">Số lượng</span>

            <div className="flex items-center gap-3">
              <button
                onClick={decrease}
                disabled={quantity <= 1}
                className="flex size-9 items-center justify-center rounded-[10px] border border-border text-slate-700 disabled:opacity-50"
                type="button"
              >
                -
              </button>
              <span className="min-w-6 text-center font-semibold text-slate-950">{quantity}</span>
              <button
                onClick={increase}
                disabled={quantity >= product.stock}
                className="flex size-9 items-center justify-center rounded-[10px] border border-border text-slate-700 disabled:opacity-50"
                type="button"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MainButton
            className={cn(status === "INACTIVE" && "pointer-events-none opacity-50")}
            fullWidth
            size="large"
          >
            <ShoppingCart className="size-4.5" />
            Mua ngay
          </MainButton>

          <MainButton
            onClick={handleAddCart}
            className={cn(status === "INACTIVE" && "pointer-events-none opacity-50")}
            fullWidth
            size="large"
            variant="secondary"
          >
            <Heart className="size-4.5" />
            Thêm giỏ hàng
          </MainButton>
        </div>
      </CardContent>
    </Card>
  )
}
