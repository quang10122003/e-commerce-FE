"use client"

import { useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useGetCartQuery } from "@/features/auth/tokenApi"
import { closeCartSidebar } from "@/features/cart/cartSidebarSlice"
import MainButton from "@/components/ui/main-button"
import { cn } from "@/lib/utils"

const MAX_VISIBLE_ITEMS = 4

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function getProductInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export default function CartSidebar() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.cartSidebar.isOpen)
  const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth)

  function handleClose() {
    dispatch(closeCartSidebar())
  }

  // Dong sidebar neu logout
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      handleClose()
    }
  }, [isAuthenticated, isOpen])

  const { data, error, isFetching, isLoading } = useGetCartQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !isOpen || !isAuthenticated || isCheckingAuth,
  })

  const cartData = data?.data
  const visibleItems = (cartData?.items ?? []).slice(0, MAX_VISIBLE_ITEMS)
  const hiddenItemsCount = Math.max((cartData?.items?.length ?? 0) - visibleItems.length, 0)
  const showLoadingState = isOpen && isAuthenticated && (isLoading || isFetching)
  const showErrorState = !showLoadingState && Boolean(error)
  const showEmptyState =
    !showLoadingState &&
    !showErrorState &&
    (cartData?.items?.length ?? 0) === 0

  // 👇 Return trực tiếp, không cần createPortal, không cần isMounted check
  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-50 overflow-x-hidden max-[750px]:hidden",
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      )}
    >
      <button
        aria-label="Đóng xem trước giỏ hàng"
        className={cn(
          "absolute inset-0 border-none bg-slate-950/45 opacity-0 transition-opacity duration-300",
          isOpen && "opacity-100"
        )}
        onClick={handleClose}
        type="button"
      />

      <div
        aria-labelledby="cart-preview-title"
        aria-modal="true"
        className={cn(
          "absolute right-0 top-0 flex h-dvh w-[min(92vw,420px)] max-w-full flex-col overflow-hidden border-l border-slate-200 bg-white shadow-[-24px_0_70px_-40px_rgba(15,23,42,0.55)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isOpen ? "translate-x-0" : "translate-x-[calc(100%+2rem)]"
        )}
        id="cart-preview-dialog"
        role="dialog"
      >
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_48%,#ffffff_100%)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            Cart preview
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-950" id="cart-preview-title">
                Giỏ hàng của bạn
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {cartData?.totalQuantity ?? 0} sản phẩm đang chờ thanh toán
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm">
                {formatCurrency(cartData?.totalAmount ?? 0)}
              </p>

              <button
                aria-label="Đóng giỏ hàng"
                className="inline-flex size-10 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                onClick={handleClose}
                type="button"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {showLoadingState ? (
          <div className="px-5 py-12 text-center">
            <p className="text-base font-semibold text-slate-900">Đang tải giỏ hàng</p>
            <p className="mt-2 text-sm text-slate-500">
              Dữ liệu giỏ hàng của bạn đang được đồng bộ.
            </p>
          </div>
        ) : showErrorState ? (
          <div className="px-5 py-12 text-center">
            <p className="text-base font-semibold text-slate-900">Không thể tải giỏ hàng</p>
            <p className="mt-2 text-sm text-slate-500">
              Hãy thử mở lại preview sau ít giây nữa.
            </p>
          </div>
        ) : showEmptyState ? (
          <div className="px-5 py-12 text-center">
            <p className="text-base font-semibold text-slate-900">Giỏ hàng đang trống</p>
            <p className="mt-2 text-sm text-slate-500">
              Thêm vài sản phẩm để preview giỏ hàng xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid gap-3">
                {visibleItems.map((item) => (
                  <article
                    key={item.productId}
                    className="flex items-center gap-3 rounded-[20px] border border-slate-100 bg-slate-50/90 p-3"
                  >
                    <div
                      className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_45%,#e0f2fe_100%)] text-sm font-bold text-sky-800"
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

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.productName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        SL: {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </article>
                ))}

                {hiddenItemsCount > 0 ? (
                  <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                    Còn {hiddenItemsCount} sản phẩm khác trong giỏ hàng.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white p-4">
              <Link href="/cart" onClick={handleClose}>
                <MainButton fullWidth className="rounded-2xl">
                  Xem trang giỏ hàng
                </MainButton>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}