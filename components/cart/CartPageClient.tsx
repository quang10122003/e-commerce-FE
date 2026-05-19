import Link from "next/link"

import Container from "@/components/shared/Container"
import MainButton from "@/components/ui/main-button"
import { formatCurrency } from "@/lib/format"
import type { CartResponse } from "@/types/cart/CartResponse"

function getProductInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

type CartPageClientProps = {
  cartData: CartResponse | null
  errorMessage: string | null
}

export default function CartPageClient({ cartData, errorMessage }: CartPageClientProps) {
  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <div className="space-y-6">
        <div className="surface-primary px-5 py-6 sm:px-6">
          <p className="section-kicker">Cart</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
                Giỏ hàng của bạn
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                Mọi thông tin trong giỏ hàng được gom theo surface sáng, rõ cấu trúc và dễ kiểm
                tra trước khi thanh toán.
              </p>
            </div>
            <div className="rounded-[12px] bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
              {cartData?.totalQuantity ?? 0} sản phẩm
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="surface-primary px-6 py-16 text-center">
            <p className="text-base font-semibold text-slate-950">Không thể tải giỏ hàng</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Vui lòng thử lại sau ít phút nữa.
            </p>
          </div>
        ) : (cartData?.items.length ?? 0) === 0 ? (
          <div className="surface-primary px-6 py-16 text-center">
            <p className="text-base font-semibold text-slate-950">Giỏ hàng đang trống</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Hãy thêm vài sản phẩm để bắt đầu trải nghiệm mua sắm.
            </p>
            <div className="mt-6">
              <Link href="/products">
                <MainButton>Xem sản phẩm</MainButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:items-start">
            <div className="surface-primary grid gap-4 p-4 sm:p-5">
              {cartData?.items.map((item) => (
                <article
                  key={item.productId}
                  className="surface-secondary flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <div
                    className="flex h-24 w-full shrink-0 items-center justify-center rounded-[12px] border border-border bg-white text-sm font-bold text-slate-600 sm:h-22 sm:w-22"
                    style={
                      item.thumbnail
                        ? {
                            backgroundImage: `url(${item.thumbnail})`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                          }
                        : undefined
                    }
                  >
                    {!item.thumbnail ? getProductInitials(item.productName) : null}
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <h2 className="text-[18px] font-semibold text-slate-950">{item.productName}</h2>
                    <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                      <span className="rounded-full bg-white px-3 py-1 font-medium">
                        Số lượng: {item.quantity}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 font-medium">
                        Đơn giá: {formatCurrency(item.unitPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Thành tiền
                    </p>
                    <p className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <aside className="surface-primary p-5 sm:p-6 lg:sticky lg:top-28">
              <p className="section-kicker">Summary</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Tóm tắt đơn hàng
              </h2>

              <div className="mt-5 space-y-3">
                <div className="surface-secondary flex items-center justify-between p-4 text-sm">
                  <span className="text-slate-500">Số lượng sản phẩm</span>
                  <span className="font-semibold text-slate-950">{cartData?.totalQuantity}</span>
                </div>
                <div className="surface-secondary flex items-center justify-between p-4 text-sm">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="font-semibold text-slate-950">
                    {formatCurrency(cartData?.totalAmount ?? 0)}
                  </span>
                </div>
                <div className="rounded-[16px] border border-[#bfd2f6] bg-primary-soft p-4">
                  <p className="text-sm font-medium text-primary">Tổng thanh toán</p>
                  <p className="mt-2 text-[30px] font-bold tracking-tight text-slate-950">
                    {formatCurrency(cartData?.totalAmount ?? 0)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <MainButton fullWidth>Tiến hành thanh toán</MainButton>
                <Link href="/products">
                  <MainButton fullWidth variant="secondary">
                    Tiếp tục mua sắm
                  </MainButton>
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </Container>
  )
}
