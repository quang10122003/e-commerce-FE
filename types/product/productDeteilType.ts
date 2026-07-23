import type { MoneyValue } from "@/types/money/MoneyValue";
import { ProductStatus } from "./ProductsummerType";

export type ProductDetail = {
    id: number;
    name: string;
    purchases: number;
    description: string;
    price: MoneyValue;
    stock: number;
    status: ProductStatus;
    nameCategory: string;
    thumbnail: string | null;
    url: Array<string | null>;
};
