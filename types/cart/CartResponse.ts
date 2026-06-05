import { CartItemResponse } from "./CartItemResponse";
import type { MoneyValue } from "@/types/money/MoneyValue";

export interface CartResponse {
    items: CartItemResponse[];
    totalQuantity: number;
    totalAmount: MoneyValue;
}
