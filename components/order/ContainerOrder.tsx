import { OrderResponse } from "@/types/order/OrderResponse"
import MainButton from "@/components/ui/main-button"
import { formatCurrency, formatDateTime, multiplyMoney } from "@/lib/format"
import { getOrderStatusMeta } from "@/lib/order-display"
import { getProductInitials } from "@/lib/product-display"

type Props = {
  filteredOrder: OrderResponse
}

export default function ContainerOrder({ filteredOrder }: Props) {
  const statusMeta = getOrderStatusMeta(filteredOrder.status)

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
            </div>
          </div>

          <div className="rounded-[12px] bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
            {filteredOrder.items.length} sản phẩm
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:p-5">
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
            {filteredOrder.status === "PENDING" ? (
              <MainButton variant="dangerSoft">Hủy đơn</MainButton>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
