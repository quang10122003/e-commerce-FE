import type { MoneyValue } from "@/types/money/MoneyValue"

export interface OrderItemResponse {
    id: number
    productId: number | null
    productName: string
    price: MoneyValue
    quantity: number
    thumbnail: string | null
}

export type OrderStatus =
    | "PENDING"
    | "SHIPPING"
    | "COMPLETED"
    | "CANCELLED"

export interface OrderResponse {
    id: number
    status: OrderStatus

    shippingName: string
    shippingPhone: string
    shippingAddress: string

    totalAmount: MoneyValue

    createdAt: string // ISO date string từ backend

    items: OrderItemResponse[]
}

export interface CheckoutResponse {
    orderCode: string;
    paymentMethod: string;
    status: string;
}
