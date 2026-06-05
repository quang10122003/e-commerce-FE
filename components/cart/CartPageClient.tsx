"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"

import {
  useCalculateCheckoutTotalMutation,
  useRemoveCartItemMutation,
} from "@/client/api/backend-api"
import Container from "@/components/shared/Container"
import MainButton from "@/components/ui/main-button"
import { useNotification } from "@/components/ui/NotificationProvider"
import { extractErrorMessage } from "@/lib/error"
import { formatCurrency, multiplyMoney } from "@/lib/format"
import { getProductInitials } from "@/lib/product-display"
import type { CartItemResponse } from "@/types/cart/CartItemResponse"
import type { CartResponse } from "@/types/cart/CartResponse"
import type { MoneyValue } from "@/types/money/MoneyValue"

type CartPageClientProps = {
  cartData: CartResponse | null
  errorMessage: string | null
}

const CHECKOUT_TOTAL_DEBOUNCE_MS = 500

// Giới hạn số lượng sản phẩm trong khoảng hợp lệ từ 1 đến tồn kho.
function clampQuantity(value: number, stock: number) {
  if (stock <= 0) {
    return 0
  }

  return Math.min(Math.max(1, value), stock)
}

// Tính thành tiền tạm thời cho một dòng sản phẩm.
function getItemTotal(item: CartItemResponse) {
  return multiplyMoney(item.unitPrice, item.quantity)
}

// Chuẩn hóa số lượng hiển thị để không vượt tồn kho hiện tại.
function normalizeCartItem(item: CartItemResponse) {
  const quantity = clampQuantity(item.quantity, item.stock)

  return {
    ...item,
    quantity,
    totalPrice: multiplyMoney(item.unitPrice, quantity),
  }
}

// Chuẩn hóa toàn bộ giỏ hàng trước khi render lên UI.
function normalizeCartItems(items: CartItemResponse[]) {
  return items.map(normalizeCartItem)
}

// Lọc danh sách sản phẩm đang được chọn để gửi lên API tính tổng tiền.
function getSelectedCartItems(items: CartItemResponse[], selectedProductIds: number[]) {
  return items.filter((item) => selectedProductIds.includes(item.productId))
}

// Tạo URL checkout kèm productId và số lượng đã chọn trong giỏ hàng.
function buildCheckoutHref(selectedItems: CartItemResponse[]) {
  const params = new URLSearchParams()

  params.set(
    "items",
    selectedItems.map((item) => `${item.productId}:${item.quantity}`).join(",")
  )

  return `/checkout?${params.toString()}`
}

export default function CartPageClient({ cartData, errorMessage }: CartPageClientProps) {
  const { showNotification } = useNotification()
  const [calculateCheckoutTotal, { isLoading: isCalculatingTotal }] =
    useCalculateCheckoutTotalMutation()
  const [removeCartItem] = useRemoveCartItemMutation()

  // Lưu danh sách sản phẩm đang hiển thị trong giỏ hàng.
  const [items, setItems] = useState<CartItemResponse[]>(() =>
    normalizeCartItems(cartData?.items ?? [])
  )

  // Lưu danh sách productId đang được chọn để thanh toán, mặc định chưa chọn sản phẩm nào.
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])

  // Lưu tổng tiền backend trả về theo danh sách sản phẩm đã chọn.
  const [checkoutTotalAmount, setCheckoutTotalAmount] = useState<MoneyValue>(0)

  // Lưu productId đang xóa để khóa đúng nút xóa trên UI.
  const [removingProductId, setRemovingProductId] = useState<number | null>(null)

  // Lưu timer debounce để chỉ gọi API khi user ngừng chỉnh số lượng.
  const checkoutTotalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Lưu thứ tự request để bỏ qua response cũ trả về chậm hơn.
  const checkoutTotalRequestIdRef = useRef(0)

  // Danh sách sản phẩm đang được chọn để hiển thị summary.
  const selectedItems = useMemo(
    () => getSelectedCartItems(items, selectedProductIds),
    [items, selectedProductIds]
  )

  // Tổng số lượng của các sản phẩm đang được chọn.
  const totalQuantity = useMemo(
    () => selectedItems.reduce((total, item) => total + item.quantity, 0),
    [selectedItems]
  )

  // Đường dẫn sang trang checkout theo các sản phẩm đang được chọn.
  const checkoutHref = useMemo(() => buildCheckoutHref(selectedItems), [selectedItems])

  // Danh sách productId còn hàng có thể chọn để thanh toán.
  const selectableProductIds = useMemo(
    () => items.filter((item) => item.stock > 0).map((item) => item.productId),
    [items]
  )

  // Xác định trạng thái checkbox chọn tất cả.
  const allItemsSelected =
    selectableProductIds.length > 0 && selectedProductIds.length === selectableProductIds.length

  // Gọi API backend để tính lại tổng tiền thanh toán.
  const requestCheckoutTotal = useCallback(
    async (nextSelectedItems: CartItemResponse[]) => {
      const requestId = checkoutTotalRequestIdRef.current + 1
      checkoutTotalRequestIdRef.current = requestId

      if (nextSelectedItems.length === 0) {
        setCheckoutTotalAmount(0)
        return
      }

      try {
        const response = await calculateCheckoutTotal({
          items: nextSelectedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }).unwrap()

        if (checkoutTotalRequestIdRef.current === requestId) {
          setCheckoutTotalAmount(response.data?.totalAmount ?? 0)
        }
      } catch (error) {
        showNotification(extractErrorMessage(error), {
          variant: "error",
        })
      }
    },
    [calculateCheckoutTotal, showNotification]
  )

  // Delay việc gọi API tính tổng khi user đang chỉnh số lượng liên tục.
  const scheduleCheckoutTotal = useCallback(
    (nextSelectedItems: CartItemResponse[]) => {
      if (checkoutTotalDebounceRef.current) {
        clearTimeout(checkoutTotalDebounceRef.current)
      }

      checkoutTotalDebounceRef.current = setTimeout(() => {
        void requestCheckoutTotal(nextSelectedItems)
      }, CHECKOUT_TOTAL_DEBOUNCE_MS)
    },
    [requestCheckoutTotal]
  )

  // Dọn timer khi component unmount để tránh gọi API thừa.
  useEffect(() => {
    return () => {
      if (checkoutTotalDebounceRef.current) {
        clearTimeout(checkoutTotalDebounceRef.current)
      }
    }
  }, [])

  // Hủy lần debounce cũ trước các thao tác cần tính tổng tiền ngay.
  function clearScheduledCheckoutTotal() {
    if (checkoutTotalDebounceRef.current) {
      clearTimeout(checkoutTotalDebounceRef.current)
      checkoutTotalDebounceRef.current = null
    }
  }

  // Bật/tắt chọn một sản phẩm và tính lại tổng tiền ngay.
  function handleToggleProduct(productId: number) {
    const currentItem = items.find((item) => item.productId === productId)

    if (!currentItem || currentItem.stock <= 0) {
      return
    }

    const nextSelectedProductIds = selectedProductIds.includes(productId)
      ? selectedProductIds.filter((id) => id !== productId)
      : [...selectedProductIds, productId]

    setSelectedProductIds(nextSelectedProductIds)
    clearScheduledCheckoutTotal()
    void requestCheckoutTotal(getSelectedCartItems(items, nextSelectedProductIds))
  }

  // Bật/tắt chọn tất cả sản phẩm và tính lại tổng tiền ngay.
  function handleToggleAll() {
    const nextSelectedProductIds = allItemsSelected ? [] : selectableProductIds

    setSelectedProductIds(nextSelectedProductIds)
    clearScheduledCheckoutTotal()
    void requestCheckoutTotal(getSelectedCartItems(items, nextSelectedProductIds))
  }

  // Cập nhật số lượng trên UI và debounce API nếu sản phẩm đang được chọn.
  function handleQuantityChange(productId: number, nextQuantity: number) {
    const nextItems = items.map((item) => {
      if (item.productId !== productId) {
        return item
      }

      const quantity = clampQuantity(nextQuantity, item.stock)

      return {
        ...item,
        quantity,
        totalPrice: multiplyMoney(item.unitPrice, quantity),
      }
    })

    setItems(nextItems)

    if (selectedProductIds.includes(productId)) {
      scheduleCheckoutTotal(getSelectedCartItems(nextItems, selectedProductIds))
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng qua API và cập nhật lại summary.
  async function handleRemoveProduct(productId: number) {
    setRemovingProductId(productId)

    try {
      const response = await removeCartItem(productId).unwrap()
      const nextItems = normalizeCartItems(
        response.data?.items ?? items.filter((item) => item.productId !== productId)
      )
      const nextSelectedProductIds = selectedProductIds.filter((id) => id !== productId)

      setItems(nextItems)
      setSelectedProductIds(nextSelectedProductIds)
      clearScheduledCheckoutTotal()
      void requestCheckoutTotal(getSelectedCartItems(nextItems, nextSelectedProductIds))

      showNotification("Xóa sản phẩm khỏi giỏ hàng thành công", {
        variant: "success",
      })
    } catch (error) {
      showNotification(extractErrorMessage(error), {
        variant: "error",
      })
    } finally {
      setRemovingProductId(null)
    }
  }

  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <div className="space-y-6">
        {/* Header giỏ hàng và tổng số lượng sản phẩm hiện có. */}
        <div className="surface-primary px-5 py-6 sm:px-6">
          <p className="section-kicker">Cart</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
                Giỏ hàng của bạn
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                Chọn sản phẩm, điều chỉnh số lượng và kiểm tra tổng tiền trước khi thanh toán.
              </p>
            </div>
            <div className="rounded-[12px] bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
              {items.reduce((total, item) => total + item.quantity, 0)} sản phẩm
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
        ) : items.length === 0 ? (
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
            {/* Danh sách sản phẩm trong giỏ hàng. */}
            <div className="surface-primary grid gap-4 p-4 sm:p-5">
              <label className="surface-secondary flex cursor-pointer items-center gap-3 p-4 text-sm font-semibold text-slate-700">
                <input
                  checked={allItemsSelected}
                  className="size-4 rounded border-border accent-primary"
                  disabled={selectableProductIds.length === 0}
                  onChange={handleToggleAll}
                  type="checkbox"
                />
                Chọn tất cả sản phẩm
              </label>

              {items.map((item) => {
                // Tính trạng thái chọn và giới hạn số lượng cho từng dòng sản phẩm.
                const isSelected = selectedProductIds.includes(item.productId)
                const isMinQuantity = item.quantity <= 1
                const isMaxQuantity = item.quantity >= Math.max(1, item.stock)
                const isRemoving = removingProductId === item.productId
                const isOutOfStock = item.stock <= 0

                return (
                  <article
                    key={item.productId}
                    className={`surface-secondary relative grid gap-4 overflow-hidden p-4 sm:grid-cols-[auto_88px_minmax(0,1fr)] sm:items-center lg:grid-cols-[auto_88px_minmax(0,1fr)_auto] ${
                      isOutOfStock ? "border-[#f3c9c9] bg-danger-soft/50" : ""
                    }`}
                  >
                    {isOutOfStock ? (
                      <div className="pointer-events-none absolute inset-0 z-10 bg-white/55 backdrop-grayscale" />
                    ) : null}

                    <input
                      aria-label={`Chọn ${item.productName}`}
                      checked={isSelected}
                      className="relative z-20 size-4 rounded border-border accent-primary"
                      disabled={isOutOfStock}
                      onChange={() => handleToggleProduct(item.productId)}
                      type="checkbox"
                    />

                    <div
                      className="relative z-20 flex h-24 w-full shrink-0 items-center justify-center rounded-[12px] border border-border bg-white text-sm font-bold text-slate-600 sm:h-22 sm:w-22"
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

                    <div className="min-w-0 space-y-3">
                      <div className="space-y-2">
                        <h2 className="text-[18px] font-semibold text-slate-950">
                          {item.productName}
                        </h2>
                        <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                          <span className="rounded-full bg-white px-3 py-1 font-medium">
                            Mã SP: {item.productId}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 font-medium">
                            Đơn giá: {formatCurrency(item.unitPrice)}
                          </span>
                          {isOutOfStock ? (
                            <span className="rounded-full bg-danger-soft px-3 py-1 font-semibold text-[#b42318]">
                              Hết hàng
                            </span>
                          ) : null}
                        </div>
                        {isOutOfStock ? (
                          <p className="text-sm font-medium text-[#b42318]">
                            Sản phẩm này đang hết hàng nên chưa thể chọn thanh toán.
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-10 items-center rounded-[12px] border border-border bg-white">
                          <button
                            aria-label="Giảm số lượng"
                            className="flex size-10 items-center justify-center text-slate-700 transition hover:text-primary disabled:opacity-40"
                            disabled={isOutOfStock || isMinQuantity}
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            type="button"
                          >
                            <Minus className="size-4" />
                          </button>
                          <input
                            aria-label={`Số lượng ${item.productName}`}
                            className="h-full w-14 border-x border-border text-center text-sm font-semibold text-slate-950 outline-none"
                            disabled={isOutOfStock}
                            max={Math.max(0, item.stock)}
                            min={isOutOfStock ? 0 : 1}
                            onChange={(event) =>
                              handleQuantityChange(
                                item.productId,
                                Number.parseInt(event.target.value, 10) || 1
                              )
                            }
                            type="number"
                            value={item.quantity}
                          />
                          <button
                            aria-label="Tăng số lượng"
                            className="flex size-10 items-center justify-center text-slate-700 transition hover:text-primary disabled:opacity-40"
                            disabled={isOutOfStock || isMaxQuantity}
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            type="button"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>

                        <MainButton
                          disabled={isRemoving}
                          onClick={() => handleRemoveProduct(item.productId)}
                          size="small"
                          type="button"
                          variant="dangerSoft"
                        >
                          <Trash2 className="size-4" />
                          {isRemoving ? "Đang xóa" : "Xóa"}
                        </MainButton>
                      </div>
                    </div>

                    <div className="text-left sm:col-start-3 lg:col-start-auto lg:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Thành tiền
                      </p>
                      <p className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                        {formatCurrency(getItemTotal(item))}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Summary thanh toán theo sản phẩm đã chọn. */}
            <aside className="surface-primary p-5 sm:p-6 lg:sticky lg:top-28">
              <p className="section-kicker">Summary</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Tóm tắt đơn hàng
              </h2>

              <div className="mt-5 space-y-3">
                <div className="surface-secondary flex items-center justify-between p-4 text-sm">
                  <span className="text-slate-500">Sản phẩm đã chọn</span>
                  <span className="font-semibold text-slate-950">{selectedItems.length}</span>
                </div>
                <div className="surface-secondary flex items-center justify-between p-4 text-sm">
                  <span className="text-slate-500">Tổng số lượng</span>
                  <span className="font-semibold text-slate-950">{totalQuantity}</span>
                </div>
                <div className="surface-secondary flex items-center justify-between p-4 text-sm">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="font-semibold text-slate-950">
                    {isCalculatingTotal ? "Đang tính..." : formatCurrency(checkoutTotalAmount)}
                  </span>
                </div>
                <div className="rounded-[16px] border border-[#bfd2f6] bg-primary-soft p-4">
                  <p className="text-sm font-medium text-primary">Tổng thanh toán</p>
                  <p className="mt-2 text-[30px] font-bold tracking-tight text-slate-950">
                    {isCalculatingTotal ? "Đang tính..." : formatCurrency(checkoutTotalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {selectedItems.length > 0 ? (
                  <Link href={checkoutHref}>
                    <MainButton fullWidth>Tiến hành thanh toán</MainButton>
                  </Link>
                ) : (
                  <MainButton disabled fullWidth>
                    Tiến hành thanh toán
                  </MainButton>
                )}
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
