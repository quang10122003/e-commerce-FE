"use client"
import OrderStatus from "@/types/order/OrderStatus"
import Container from "../shared/Container"
import OrderStatusStepper from "./OrderStatusStepper"
import { useState } from "react"
import ContainerOrder from "./ContainerOrder"
import { useGetOrderQuery } from "@/features/auth/tokenApi"
import { OrderResponse } from "@/types/order/OrderResponse"


export default function OrderClient() {
    const { data, error, isError, isLoading } = useGetOrderQuery()
    const orders: OrderResponse[] = data?.data ?? []

    // state trỏ trạng thái đơn hàng đang đc mở 
    const [selecStatus, setSelecStatus] = useState<string>("All")

    const filteredOrders = orders.filter((order) => {
        if (selecStatus === "All") return true
        return order.status === selecStatus
    })
    // các trạng thái
    const status: OrderStatus[] = [
        {
            title: "Tất Cả",
            value: "All"
        },
        {
            title: "Chờ xác nhận",
            value: "PENDING"
        }, {
            title: "Đang vận chuyển",
            value: "SHIPPING"
        },
        {
            title: "Hoàn Thành",
            value: "COMPLETED"
        },
        {
            title: "Đã Hủy",
            value: "CANCELLED"
        }]

    return (
        <Container className="min-h-screen">
            <OrderStatusStepper orderStatus={status} setSelecStatus={setSelecStatus} selecStatus={selecStatus} />
            {filteredOrders.map((item) => (
                <ContainerOrder key={item.id} filteredOrder={item} />
            ))}

        </Container>
    )
}