import { CartItemResponse } from "./CartItemResponse";

export interface CartResponse {
    items: CartItemResponse[];
    totalQuantity: number;
    totalAmount: number;
}
