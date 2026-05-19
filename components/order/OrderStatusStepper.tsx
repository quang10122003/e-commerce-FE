import Link from "next/link"
import { cn } from "@/lib/utils"
import OrderStatus from "@/types/order/OrderStatus"

type PropsOrderStatusStepper = {
  orderStatus: OrderStatus[]
  selecStatus: string
}

function buildOrderStatusHref(status: string) {
  if (status === "All") {
    return "/order"
  }

  const params = new URLSearchParams()
  params.set("status", status)

  return `/order?${params}`
}

export default function OrderStatusStepper({
  orderStatus,
  selecStatus,
}: PropsOrderStatusStepper) {
  return (
    <section className="surface-primary flex gap-2 overflow-x-auto p-3">
      {orderStatus.map((item) => (
        <Link
          href={buildOrderStatusHref(item.value)}
          key={item.value}
          className={cn(
            "rounded-[12px] px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
            selecStatus === item.value
              ? "bg-primary-soft text-primary"
              : "bg-white text-slate-600 hover:bg-primary-soft hover:text-primary"
          )}
        >
          {item.title}
        </Link>
      ))}
    </section>
  )
}
