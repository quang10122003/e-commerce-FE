export type ProductStatus = "ACTIVE" | "INACTIVE";
export interface ProductType {
    id: number;
    name: string;
    purchases:number
    description: string | null;
    price: number;
    stock: number;
    status: ProductStatus
    categoryId: number | null;
    thumbnail: string ;
    createdAt: string; // LocalDateTime
    updatedAt: string; // LocalDateTime
}


