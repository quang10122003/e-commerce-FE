import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { API_BASE_URL } from "@/lib/api"
import { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import { AuthResponse } from "@/types/Auth/AuthResponse"
import { LoginRequest } from "@/types/Auth/LoginRequest"
import { SignupRequest } from "@/types/Auth/SignupRequest"

export const loginApi = createApi({
    reducerPath: "loginApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/auth`,
    }),
    endpoints: (builder) => ({
        login: builder.mutation<ApiResponseType<AuthResponse>, LoginRequest>({
            query: (body) => ({
                url: "/login",
                method: "POST",
                body,
                validateStatus: (response, result: ApiResponseType<AuthResponse>) =>
                    response.status < 400 && result.success,
            }),
        }),
        signup: builder.mutation<ApiResponseType<AuthResponse>, SignupRequest>({
            query: (body) => ({
                url: "/signup",
                method: "POST",
                body,
                validateStatus: (response, result: ApiResponseType<AuthResponse>) =>
                    response.status < 400 && result.success,
            }),
        }),
    }),
})

export const { useLoginMutation, useSignupMutation } = loginApi
