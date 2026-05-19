"use client"

import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { clearAuthenticatedUser } from "@/client/session/sessionSlice"
import { openLogin } from "@/client/session/loginModalSlice"
import { pushPendingRedirectUrl } from "@/client/session/redirect-stack"
import type { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import type AddCartRequest from "@/types/cart/AddCartRequest"
import type { CartResponse } from "@/types/cart/CartResponse"
import type { AuthResponse } from "@/types/Auth/AuthResponse"
import type { CurrentUserResponse } from "@/types/Auth/CurrentUserResponse"
import type { LoginRequest } from "@/types/Auth/LoginRequest"
import type { SignupRequest } from "@/types/Auth/SignupRequest"
import type { OrderResponse } from "@/types/order/OrderResponse"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/backend",
  credentials: "include",
  prepareHeaders: (headers) => {
    // Browser code only talks to Next; httpOnly cookies stay invisible to JavaScript.
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json")
    }

    return headers
  },
})

function getCurrentBrowserRoute() {
  if (typeof window === "undefined") {
    return null
  }

  const { hash, pathname, search } = window.location

  if (!pathname.startsWith("/")) {
    return null
  }

  return `${pathname}${search}${hash}`
}

function isFailedApiResponse(data: unknown) {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    (data as { success?: unknown }).success === false
  )
}

function getApiFailureMessage(data: unknown) {
  const response = data as { error?: { message?: unknown }; message?: unknown }

  if (typeof response.error?.message === "string" && response.error.message.trim()) {
    return response.error.message
  }

  if (typeof response.message === "string" && response.message.trim()) {
    return response.message
  }

  return "Request failed."
}

const backendBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if ("data" in result && isFailedApiResponse(result.data)) {
    return {
      error: {
        data: result.data,
        error: getApiFailureMessage(result.data),
        status: "CUSTOM_ERROR",
      },
    }
  }

  if (result.error?.status === 401) {
    clearAuthenticatedUser(api.dispatch)

    if (api.endpoint !== "getMe" && api.endpoint !== "logout") {
      pushPendingRedirectUrl(getCurrentBrowserRoute())
      api.dispatch(openLogin())
    }
  }

  return result
}

export const backendApi = createApi({
  baseQuery: backendBaseQuery,
  endpoints: (builder) => ({
    addCart: builder.mutation<ApiResponseType<CartResponse>, AddCartRequest>({
      invalidatesTags: ["Cart"],
      query: (body) => ({
        body,
        method: "POST",
        url: "/cart/add",
      }),
    }),
    getCart: builder.query<ApiResponseType<CartResponse>, void>({
      providesTags: ["Cart"],
      query: () => ({
        method: "GET",
        url: "/cart/me",
      }),
    }),
    getMe: builder.query<ApiResponseType<CurrentUserResponse>, void>({
      providesTags: ["Auth"],
      query: () => ({
        method: "GET",
        url: "/auth/me",
      }),
    }),
    getOrder: builder.query<ApiResponseType<OrderResponse[]>, void>({
      providesTags: ["Orders"],
      query: () => ({
        method: "GET",
        url: "/orders/me",
      }),
    }),
    login: builder.mutation<ApiResponseType<AuthResponse>, LoginRequest>({
      invalidatesTags: ["Auth", "Cart", "Orders"],
      query: (body) => ({
        body,
        method: "POST",
        url: "/auth/login",
      }),
    }),
    logout: builder.mutation<ApiResponseType<null>, void>({
      invalidatesTags: ["Auth", "Cart", "Orders"],
      query: () => ({
        method: "POST",
        url: "/auth/logout",
      }),
    }),
    signup: builder.mutation<ApiResponseType<AuthResponse>, SignupRequest>({
      invalidatesTags: ["Auth", "Cart", "Orders"],
      query: (body) => ({
        body,
        method: "POST",
        url: "/auth/signup",
      }),
    }),
  }),
  reducerPath: "backendApi",
  tagTypes: ["Auth", "Cart", "Orders"],
})

export const {
  useAddCartMutation,
  useGetCartQuery,
  useGetMeQuery,
  useGetOrderQuery,
  useLazyGetCartQuery,
  useLazyGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
} = backendApi
