import { createApi } from "@reduxjs/toolkit/query/react"
import { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import { CurrentUserResponse } from "@/types/Auth/CurrentUserResponse"
import { privateBaseQuery } from "@/features/auth/privateBaseQuery"
import { CartResponse } from "@/types/cart/CartResponse"

export const tokenApi = createApi({
    reducerPath: "tokenApi",
    // Dung privateBaseQuery de moi endpoint ben duoi tu dong di qua auth interceptor.
    baseQuery: privateBaseQuery,
    endpoints: (builder) => ({
        getMe: builder.query<ApiResponseType<CurrentUserResponse>, void>({
            query: () => ({
                url: "auth/me",
            }),
        }),
        getCart: builder.query<ApiResponseType<CartResponse>, void>({
            query: () => ({
                url: "/cart/me"
            })
        })
    }),
})

export const {
    useGetMeQuery,
    useLazyGetMeQuery,
    useGetCartQuery,
    useLazyGetCartQuery
} = tokenApi
