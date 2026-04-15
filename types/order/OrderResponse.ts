export interface OrderItemResponse {
    id: number
    productId: number | null
    productName: string
    price: number
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

    totalAmount: number

    createdAt: string // ISO date string từ backend

    items: OrderItemResponse[]
}