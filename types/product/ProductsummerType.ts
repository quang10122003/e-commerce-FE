import type { MoneyValue } from "@/types/money/MoneyValue";

export type ProductStatus = "ACTIVE" | "INACTIVE";
export interface ProductType {
    id: number;
    name: string;
    purchases:number
    description: string | null;
    price: MoneyValue;
    stock: number;
    status: ProductStatus
    categoryId: number | null;
    thumbnail: string ;
    createdAt: string; // LocalDateTime
    updatedAt: string; // LocalDateTime
}


