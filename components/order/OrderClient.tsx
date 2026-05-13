"use client"

import { useState } from "react"

import Container from "../shared/Container"
import Loading from "../shared/Loading"
import ContainerOrder from "./ContainerOrder"
import OrderStatusStepper from "./OrderStatusStepper"
import { useGetOrderQuery } from "@/features/auth/tokenApi"
import { OrderResponse } from "@/types/order/OrderResponse"
import OrderStatus from "@/types/order/OrderStatus"

export default function OrderClient() {
  const { data, error, isLoading } = useGetOrderQuery()
  const orders: OrderResponse[] = data?.data ?? []
  const [selecStatus, setSelecStatus] = useState<string>("All")

  const filteredOrders = orders.filter((order) => {
    if (selecStatus === "All") return true
    return order.status === selecStatus
  })

  const status: OrderStatus[] = [
    {
      title: "Tất cả",
      value: "All",
    },
    {
      title: "Chờ xác nhận",
      value: "PENDING",
    },
    {
      title: "Đang vận chuyển",
      value: "SHIPPING",
    },
    {
      title: "Hoàn thành",
      value: "COMPLETED",
    },
    {
      title: "Đã hủy",
      value: "CANCELLED",
    },
  ]

  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <div className="space-y-6">
        <div className="surface-primary px-5 py-6 sm:px-6">
          <p className="section-kicker">Orders</p>
          <h1 className="mt-2 text-[30px] font-bold tracking-[-0.03em] text-slate-950">
            Đơn hàng của bạn
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Theo dõi trạng thái đơn hàng trong giao diện sáng rõ, ít nhiễu và nhất quán với toàn
            bộ hệ thống.
          </p>
        </div>

        <OrderStatusStepper
          orderStatus={status}
          setSelecStatus={setSelecStatus}
          selecStatus={selecStatus}
        />

        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="surface-primary px-6 py-16 text-center">
            <p className="text-base font-semibold text-slate-950">Không thể tải đơn hàng</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Vui lòng thử lại sau ít phút nữa.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="surface-primary px-6 py-16 text-center">
            <p className="text-base font-semibold text-slate-950">Chưa có đơn hàng phù hợp</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Hãy chọn trạng thái khác hoặc quay lại sau khi có đơn mới.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredOrders.map((item) => (
              <ContainerOrder key={item.id} filteredOrder={item} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
