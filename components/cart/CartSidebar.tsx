"use client"

import { useCallback, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"

import { useGetCartQuery } from "@/client/api/backend-api"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import MainButton from "@/components/ui/main-button"
import { closeCartSidebar } from "@/features/cart/cartSidebarSlice"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/cn"
import { getProductInitials } from "@/lib/product-display"

const MAX_VISIBLE_ITEMS = 4

export default function CartSidebar() {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.cartSidebar.isOpen)
  const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth)

  const handleClose = useCallback(() => {
    dispatch(closeCartSidebar())
  }, [dispatch])

  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      handleClose()
    }
  }, [isAuthenticated, isOpen, handleClose])

  const { data, error, isFetching, isLoading } = useGetCartQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !isOpen || !isAuthenticated || isCheckingAuth,
  })

  const cartData = data?.data
  const visibleItems = (cartData?.items ?? []).slice(0, MAX_VISIBLE_ITEMS)
  const hiddenItemsCount = Math.max((cartData?.items?.length ?? 0) - visibleItems.length, 0)

  const showLoadingState = isOpen && isAuthenticated && (isLoading || isFetching)
  const showErrorState = !showLoadingState && Boolean(error)
  const showEmptyState = !showLoadingState && !showErrorState && (cartData?.items?.length ?? 0) === 0

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
          "absolute inset-0 border-none bg-slate-950/18 opacity-0 transition-opacity duration-300",
          isOpen && "opacity-100"
        )}
        onClick={handleClose}
        type="button"
      />

      <div
        aria-labelledby="cart-preview-title"
        aria-modal="true"
        className={cn(
          "surface-overlay absolute right-0 top-0 flex h-dvh w-[min(92vw,420px)] max-w-full flex-col overflow-hidden transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-[calc(100%+2rem)]"
        )}
        id="cart-preview-dialog"
        role="dialog"
      >
        <div className="border-b border-border bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="section-kicker">Cart preview</p>
              <div>
                <h3 className="text-lg font-semibold text-slate-950" id="cart-preview-title">
                  Giỏ hàng của bạn
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {cartData?.totalQuantity ?? 0} sản phẩm đang chờ thanh toán
                </p>
              </div>
            </div>

            <button
              aria-label="Đóng giỏ hàng"
              className="inline-flex size-10 items-center justify-center rounded-[12px] border border-border bg-white text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
              onClick={handleClose}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <div className="mt-4 rounded-[12px] bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
            Tổng tạm tính: {formatCurrency(cartData?.totalAmount ?? 0)}
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
                  <article key={item.productId} className="surface-secondary flex gap-3 p-3">
                    <div
                      className="flex size-16 shrink-0 items-center justify-center rounded-[12px] border border-border bg-white text-sm font-bold text-slate-600"
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
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </article>
                ))}

                {hiddenItemsCount > 0 ? (
                  <div className="rounded-[12px] border border-dashed border-border bg-white px-4 py-3 text-sm font-medium text-slate-500">
                    Còn {hiddenItemsCount} sản phẩm khác trong giỏ hàng.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="border-t border-border bg-white p-4">
              <Link href="/cart" onClick={handleClose}>
                <MainButton fullWidth>Xem trang giỏ hàng</MainButton>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
