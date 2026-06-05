import type { MoneyValue } from "@/types/money/MoneyValue";

export interface CartItemResponse {
    productId: number;
    productName: string;
    thumbnail: string;
    unitPrice: MoneyValue;
    stock: number;
    quantity: number;
    totalPrice: MoneyValue;
}
