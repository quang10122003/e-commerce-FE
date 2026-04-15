"use client"
import OrderStatus from "@/types/order/OrderStatus"
import Container from "../shared/Container"
import OrderStatusStepper from "./OrderStatusStepper"
import { useState } from "react"
import OrderCard from "./OrderCard"
import ContainerOrder from "./ContainerOrder"


export default function OrderClient() {
    // state trỏ trạng thái đơn hàng đang đc mở 
    const [selecStatus, setSelecStatus] = useState<string>("All")
    // các trạng thái
    const status: OrderStatus[] = [
        {
            title: "Tất Cả",
            value: "All"
        },
        {
            title: "Chờ xác nhận",
            value: "Pending"
        }, {
            title: "Đang vận chuyển",
            value: "Shipping"
        },
        {
            title: "Hoàn Thành",
            value: "Completed"
        },
        {
            title: "Đã Hủy",
            value: "Cancelled"
        }]
    return (
        <Container className="min-h-screen">
            <OrderStatusStepper orderStatus={status} setSelecStatus={setSelecStatus} selecStatus={selecStatus} />
            <ContainerOrder/>
        </Container>
    )
}