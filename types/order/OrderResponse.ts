import type { MoneyValue } from "@/types/money/MoneyValue"

export type PaymentMethod = "COD" | "SEPAY"

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

    // Mã đơn hàng dùng để điều hướng sang trang thanh toán.
    orderCode: string

    shippingName: string
    shippingPhone: string
    shippingAddress: string

    // Phương thức thanh toán của đơn hàng.
    paymentMethod: PaymentMethod | null

    // Thời điểm hết hạn thanh toán, có thể null nếu không có payment.
    expiredAt: string | null

    totalAmount: MoneyValue

    createdAt: string // ISO date string từ backend

    items: OrderItemResponse[]
}

export interface CheckoutResponse {
    orderCode: string;
    paymentMethod: string;
    status: string;
}
