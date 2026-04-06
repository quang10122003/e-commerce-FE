import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { API_BASE_URL } from "@/lib/api"
import { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import { Category } from "@/types/category/Category"

export const categoryApi = createApi({
    reducerPath: "categoryApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
    }),
    endpoints: (builder) => ({
        // Category hien tai khong can tham so, nen query shape duoc giu toi gian.
        getCategories: builder.query<ApiResponseType<Category[]>, void>({
            query: () => "/categories",
        }),
    }),
})

export const { useGetCategoriesQuery } = categoryApi
