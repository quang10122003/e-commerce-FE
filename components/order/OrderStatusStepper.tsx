import { cn } from "@/lib/utils"
import OrderStatus from "@/types/order/OrderStatus"
import React from "react"

type PropsOrderStatusStepper = {
  orderStatus: OrderStatus[]
  selecStatus: string
  setSelecStatus: React.Dispatch<React.SetStateAction<string>>
}

export default function OrderStatusStepper({
  orderStatus,
  selecStatus,
  setSelecStatus,
}: PropsOrderStatusStepper) {
  return (
    <section className="surface-primary flex gap-2 overflow-x-auto p-3">
      {orderStatus.map((item) => (
        <button
          onClick={() => setSelecStatus(item.value)}
          key={item.value}
          className={cn(
            "rounded-[12px] px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
            selecStatus === item.value
              ? "bg-primary-soft text-primary"
              : "bg-white text-slate-600 hover:bg-primary-soft hover:text-primary"
          )}
          type="button"
        >
          {item.title}
        </button>
      ))}
    </section>
  )
}
