"use client"

import Image from "next/image"
import Link from "next/link"

import { useAddCartMutation } from "@/client/api/backend-api"
import { Card, CardContent } from "@/components/ui/card"
import MainButton from "@/components/ui/main-button"
import { formatCurrency } from "@/lib/format"
import { ProductType } from "@/types/product/ProductsummerType"
import AddCartRequest from "@/types/cart/AddCartRequest"
import { useNotification } from "../ui/NotificationProvider"

type ProductCardProps = {
  product: ProductType
}

export default function ProductCard({ product }: ProductCardProps) {
  const { showNotification } = useNotification()
  const [addCart] = useAddCartMutation()
  const isOutOfStock = product.stock <= 0

  async function handleAddCartRequest(productId: number) {
    const addcartRequest: AddCartRequest = {
      productId,
      quantity: 1,
    }
    return await addCart(addcartRequest).unwrap()
  }

  async function handleAddCart(
    productId: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault()
    event.stopPropagation()

    try {
      await handleAddCartRequest(productId)
      showNotification("Thêm sản phẩm vào giỏ hàng thành công", {
        variant: "success",
      })
    } catch (error) {
      console.log(error)
    }
  }

  const descriptionText = product.description ?? "Mô tả đang được cập nhật."

  const cardContent = (
    <Card className="group flex min-h-107 flex-col overflow-hidden rounded-[10px] border-slate-200/80 transition-transform duration-300 hover:-translate-y-1 sm:min-h-0">
      {/* Thumbnail */}
      <div className="relative aspect-[4/4.8] overflow-hidden bg-slate-100 sm:aspect-4/3">
        <Image
          width={400}
          height={400}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={product.thumbnail}
          alt={product.name}
          loading="lazy"
        />

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/72 backdrop-blur-[2px]">
            <p className="text-sm font-semibold tracking-wide text-slate-800">
              Tạm hết hàng
            </p>
            <p className="text-xs text-slate-500">Sản phẩm sẽ sớm có lại</p>
          </div>
        )}
      </div>

      <CardContent
        className={`flex flex-1 flex-col gap-3 p-5 transition-opacity ${isOutOfStock ? "opacity-40" : ""}`}
      >
        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isOutOfStock
                ? "bg-slate-100 text-slate-400"
                : "bg-primary-soft text-primary"
              }`}
          >
            {isOutOfStock ? "Hết hàng" : "Đang mở bán"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Còn {product.stock}
          </span>
        </div>

        <h2 className="line-clamp-2 text-lg font-bold leading-7 text-slate-950">
          {product.name}
        </h2>
        <p className="line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">
          {descriptionText}
        </p>

        {/* Price + actions */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Giá bán
              </p>
              <p
                className={`mt-1 text-base font-bold ${isOutOfStock ? "text-slate-400" : "text-sky-700"}`}
              >
                {formatCurrency(product.price)}
              </p>
            </div>
            <p className="text-sm font-medium text-slate-500">
              {product.purchases} lượt mua
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <MainButton
              onClick={(event) => handleAddCart(product.id, event)}
              size="small"
              type="button"
              disabled={isOutOfStock}
              className="flex-1 cursor-pointer rounded-2xl border border-sky-600 bg-white px-3 py-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
            >
              Thêm giỏ hàng
            </MainButton>
            <MainButton
              size="small"
              type="button"
              disabled={isOutOfStock}
              className="flex-1 cursor-pointer rounded-2xl bg-sky-600 px-3 py-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              Mua ngay
            </MainButton>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isOutOfStock) {
    return <div className="cursor-not-allowed">{cardContent}</div>
  }

  return <Link href={`/products/${product.id}`}>{cardContent}</Link>
}