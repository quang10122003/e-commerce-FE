export interface GetActiveProductsRequestDto {
    page?: number
    size?: number;
    sort?: string; // fiel muốn sắp xếp, kiểu sắp xếp sql
    categoryId?:number
}
