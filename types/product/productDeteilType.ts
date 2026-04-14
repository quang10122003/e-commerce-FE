import { ProductStatus } from "./ProductsummerType";

export type ProductDetail = {
    id: number;
    name: string;
    purchases: number;
    description: string;
    price: number; // BigDecimal → number
    stock: number;
    status: ProductStatus;
    nameCategory: string
    thumbnail: string;
    url: string[]; // List<String> → string[]
};