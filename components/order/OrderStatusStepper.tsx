import { cn } from "@/lib/utils"
import OrderStatus from "@/types/order/OrderStatus"
import React from "react"

type propsOrderStatusStepper={
    orderStatus: OrderStatus[],
    selecStatus:string
    setSelecStatus:React.Dispatch<React.SetStateAction<string>>
    
}
export default function OrderStatusStepper({ orderStatus, selecStatus, setSelecStatus }: propsOrderStatusStepper) {
    return (
        <section className="flex overflow-x-auto  bg-white/70 backdrop-blur-md shadow-sm ">
            {orderStatus.map((item) => (
                <div
                    onClick={() => setSelecStatus(item.value)}
                    key={item.value}
                    className={cn(
                        "min-w-36 flex-1 py-3 px-6 cursor-pointer transition-all flex items-center justify-center",
                        selecStatus == item.value
                            ? "border-b-2 border-[#ee4d2d] text-[#ee4d2d] font-semibold"
                            : "border-b-2 border-gray-200 text-gray-400"
                    )}
                >
                    <p className="text-center">{item.title}</p>
                </div>
            ))}
        </section>
    )
}