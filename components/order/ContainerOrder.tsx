"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { OrderResponse } from "@/types/order/OrderResponse"
import MainButton from "@/components/ui/main-button"
import { formatCurrency, formatDateTime, multiplyMoney } from "@/lib/format"
import { getOrderStatusMeta } from "@/lib/order-display"
import { getProductInitials } from "@/lib/product-display"

type Props = {
  filteredOrder: OrderResponse
}

// Chuyển mã phương thức thanh toán sang nhãn dễ hiểu cho người dùng.
function getPaymentMethodLabel(paymentMethod: OrderResponse["paymentMethod"]) {
  if (paymentMethod === "SEPAY") {
    return "Thanh toán qua SEPAY"
  }

  if (paymentMethod === "COD") {
    return "Thanh toán khi nhận hàng"
  }

  return "Chưa có thông tin"
}

// Định dạng thời gian còn lại để hiển thị gọn trên nút thanh toán.
function formatRemainingTime(ms: number) {
  if (ms <= 0) {
    return "00:00:00"
  }

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":")
}

// Tính thời gian còn lại (ms) dựa trên expiredAt; trả về 0 nếu không hợp lệ.
function calcRemainingMs(expiredAt: string | null | undefined): number {
  if (!expiredAt) return 0
  return Math.max(new Date(expiredAt).getTime() - Date.now(), 0)
}

export default function ContainerOrder({ filteredOrder }: Props) {
  const router = useRouter()
  const statusMeta = getOrderStatusMeta(filteredOrder.status)

  const isSepayPending =
    filteredOrder.paymentMethod === "SEPAY" &&
    filteredOrder.status === "PENDING" &&
    Boolean(filteredOrder.expiredAt)

  // Lazy init vẫn dùng để nút hiện ngay từ SSR — không bị nháy.
  // suppressHydrationWarning trên span chứa timer sẽ bỏ qua mismatch nhỏ
  // do Date.now() lệch vài ms giữa server và client.
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    isSepayPending ? calcRemainingMs(filteredOrder.expiredAt) : 0
  )

  // Cập nhật thời gian còn lại theo từng giây khi đơn đủ điều kiện thanh toán.
  useEffect(() => {
    if (!isSepayPending) return

    const tick = () => setRemainingMs(calcRemainingMs(filteredOrder.expiredAt))
    tick()
    const timerId = window.setInterval(tick, 1000)

    return () => window.clearInterval(timerId)
  }, [filteredOrder.expiredAt, isSepayPending])

  const shouldShowPayButton = isSepayPending && remainingMs > 0

  // Hiển thị cảnh báo chỉ khi đơn đang ở trạng thái chờ thanh toán và còn hạn.
  const shouldShowPaymentWarning = shouldShowPayButton

  // Mở trang thanh toán tương ứng với đơn SEPAY còn hạn.
  function handlePaymentClick() {
    if (!shouldShowPayButton) {
      return
    }

    window.open(`/payment/${filteredOrder.orderCode}`, "_blank")
  }

  return (
    <article className="surface-primary overflow-hidden">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[18px] font-semibold text-slate-950">
                Đơn hàng #{filteredOrder.id}
              </h2>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            </div>
            <div className="grid gap-1 text-sm text-slate-600">
              <p>Ngày tạo: {formatDateTime(filteredOrder.createdAt)}</p>
              <p>Người nhận: {filteredOrder.shippingName}</p>
              <p>Số điện thoại: {filteredOrder.shippingPhone}</p>
              <p>Địa chỉ: {filteredOrder.shippingAddress}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-500">Hình thức thanh toán:</span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${shouldShowPayButton
                      ? "bg-warning-soft text-warning"
                      : filteredOrder.paymentMethod === "SEPAY" || filteredOrder.paymentMethod === "COD"
                        ? "bg-primary-soft text-primary"
                        : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {getPaymentMethodLabel(filteredOrder.paymentMethod)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
            {filteredOrder.items.length} sản phẩm
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:p-5">
        {shouldShowPaymentWarning ? (
          <div className="rounded-[14px] border border-warning/20 bg-warning-soft px-4 py-3 text-warning">
            <p className="text-sm font-semibold">Đơn hàng đang chờ thanh toán</p>
            <p className="mt-1 text-sm leading-6 text-warning">
              Đây là đơn SEPAY chưa được thanh toán. Bạn cần hoàn tất trước khi bộ đếm kết thúc, nếu
              không đơn sẽ bị hủy tự động.
            </p>
          </div>
        ) : null}

        {filteredOrder.items.map((item) => (
          <div
            key={item.id}
            className="surface-secondary flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
          >
            <div
              className="flex h-20 w-full shrink-0 items-center justify-center rounded-[12px] border border-border bg-white text-sm font-bold text-slate-600 sm:h-20 sm:w-20"
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

            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-base font-semibold text-slate-950">{item.productName}</p>
              <p className="text-sm text-slate-500">
                Số lượng: {item.quantity} x {formatCurrency(item.price)}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Thành tiền
              </p>
              <p className="mt-2 text-lg font-bold text-slate-950">
                {formatCurrency(multiplyMoney(item.price, item.quantity))}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng thanh toán</p>
            <p className="mt-1 text-[24px] font-bold tracking-tight text-slate-950">
              {formatCurrency(filteredOrder.totalAmount)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <MainButton variant="secondary">Xem chi tiết</MainButton>
            {shouldShowPayButton ? (
              <MainButton variant="primary" onClick={handlePaymentClick}>
                {/* suppressHydrationWarning cho phép server/client lệch nhau vài giây
                    mà không throw lỗi — nút vẫn hiện ngay từ SSR, không bị nháy. */}
                Thanh toán{" "}
                <span suppressHydrationWarning>{formatRemainingTime(remainingMs)}</span>
              </MainButton>
            ) : null}
            {filteredOrder.status === "PENDING" ? (
              <MainButton variant="dangerSoft">Hủy đơn</MainButton>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}