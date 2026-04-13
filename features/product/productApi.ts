
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { API_BASE_URL } from "@/lib/api"
import { ApiResponseType, PagedResponseType } from "@/types/ApiResponse/ApiResponseType"
import { ProductType } from "@/types/product/ProductsummerType"
import { GetActiveProductsRequestDto } from "@/types/product/params/GetProductActiveType"
import { ProductDetail } from "@/types/product/productDeteilType"

export const productsApi = createApi({
    reducerPath: "productsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/products`,
    }),
    endpoints: (builder) => ({
        getActiveProducts: builder.query<
            ApiResponseType<PagedResponseType<ProductType>>,
            GetActiveProductsRequestDto
        >({
            // Gom default paging/sort o day de UI caller chi can truyen gia tri can override.
            query: (params) => ({
                url: "/active",
                params: {
                    page: params?.page ?? 0,
                    size: params?.size ?? 11,
                    sort: params?.sort ?? "price,ASC",
                    ...(params?.categoryId !== undefined ? { categoryId: params.categoryId } : {}),
                },
            }),
        }),
        getActiveProductsTopSelling: builder.query<ApiResponseType<ProductType[]>, void>({
            query: () => ({
                url: "/topSelling",
            }),
        }),
        getProductById: builder.query <ApiResponseType<ProductDetail>,number>({
            query:(id) =>({
                url:`/${id}`,
                method:"GET"
            })
        })
    }),
})

export const { useGetActiveProductsQuery, useGetActiveProductsTopSellingQuery,useGetProductByIdQuery } = productsApi
