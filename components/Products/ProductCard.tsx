import { Card, CardContent } from "@/components/ui/card"
import { ProductType } from "@/types/product/ProductsummerType"
import Link from "next/link"
import MainButton from "../ui/main-button"
import Image from "next/image"
import { useAddCartMutation } from "@/features/auth/tokenApi"
import AddCartRequest from "@/types/cart/AddCartRequest"
import { useNotification } from "../ui/NotificationProvider"
import { extractErrorMessage } from "@/lib/error"

type ProductCardProps = {
  product: ProductType
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function ProductCard({ product }: ProductCardProps) {
  const { showNotification } = useNotification()
  const [addCart] = useAddCartMutation()

  // xử lý call api add cart
  async function handleAddCartRequest(productID: number) {
    const addcartRequest: AddCartRequest = {
      productId: productID
    }
    return await addCart(addcartRequest).unwrap()
  }

  // xử lý repone và thông báo cho add cart
  async function handldeAddCart(
    productID: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault()
    event.stopPropagation()

    try {
      await handleAddCartRequest(productID)

      showNotification("Thêm sản phẩm vào giỏ hàng thành công", {
        variant: "success"
      })

    } catch (error) {
      const errMsg = extractErrorMessage(error)

      showNotification(errMsg, {
        variant: "error"
      })
    }
  }

  const descriptionText = product.description ?? "Mô tả đang được cập nhật."

  return (
    <Link href={`products/${product.id}`}>
      <Card className="group flex min-h-107 flex-col overflow-hidden rounded-[10px] border-slate-200/80 transition-transform duration-300 hover:-translate-y-1 sm:min-h-0">
        <div className="aspect-[4/4.8] overflow-hidden bg-slate-100 sm:aspect-4/3">
          <Image
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
          />
        </div>

        <CardContent className="grid flex-1 gap-3 p-5">
          <h2 className="line-clamp-2 text-lg font-bold leading-7 text-slate-950">
            {product.name}
          </h2>
          <p className="line-clamp-2 min-h-12 text-sm leading-6 text-slate-500 ">{descriptionText}</p>
          <p className="text-base font-bold text-sky-700">{formatCurrency(product.price)}</p>
          <div className="flex gap-2 mt-auto flex-wrap py-2.5">
            <MainButton
              onClick={(event) => handldeAddCart(product.id, event)}
              size={"small"}
              type="button"
              className="flex-1 rounded-2xl border border-sky-600 py-6 px-3 md:py-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 bg-white cursor-pointer"
            >
              Thêm giỏ hàng
            </MainButton>
            <MainButton
              size={"small"}
              type="button"
              className="flex-1 rounded-2xl bg-sky-600 py-6 px-3 md:py-4 text-sm font-semibold text-white transition hover:bg-sky-700 cursor-pointer"
            >
              Mua ngay
            </MainButton>
          </div>
        </CardContent>
      </Card>
    </Link>

  )
}
