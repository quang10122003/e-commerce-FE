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
import { getApiResponseMessage } from "@/lib/error"
import { getCurrentBrowserRoute } from "@/lib/navigation"
import type { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
import type AddCartRequest from "@/types/cart/AddCartRequest"
import type { CartResponse } from "@/types/cart/CartResponse"
import type { AuthResponse } from "@/types/Auth/AuthResponse"
import type { CurrentUserResponse } from "@/types/Auth/CurrentUserResponse"
import type { LoginRequest } from "@/types/Auth/LoginRequest"
import type { SignupRequest } from "@/types/Auth/SignupRequest"
import type { OrderResponse } from "@/types/order/OrderResponse"
import { ChatMessage, ChatRoom, WsTicketResponse } from "@/types/chat/chat"

// Gửi API client qua proxy backend của Next và kèm cookie.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/backend",
  credentials: "include",
  prepareHeaders: (headers) => {
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json")
    }

    return headers
  },
})

// Nhận diện envelope lỗi ngay cả khi HTTP status vẫn là 2xx.
function isFailedApiResponse(data: unknown) {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    (data as { success?: unknown }).success === false
  )
}

// Chuẩn hóa lỗi proxy và mở login khi API riêng tư phía client mất auth.
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
        error: getApiResponseMessage(result.data, "Request failed."),
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
    createWsTicket: builder.mutation<ApiResponseType<WsTicketResponse>, void>({
      query: () => ({
        method: "POST",
        url: "/auth/ws-ticket",
      }),
    }),
    createChatRoom: builder.mutation<ApiResponseType<ChatRoom>, number>({
      query: (productId) => ({
        method: "POST",
        url: `/chat/rooms/${productId}`,
      }),
    }),
    getProductChatRoom: builder.query<ApiResponseType<ChatRoom>, number>({
      query: (productId) => ({
        method: "GET",
        url: `/chat/rooms/${productId}`,
      }),
    }),
    getChatRoomMessages: builder.query<ApiResponseType<ChatMessage[]>, number>({
      query: (roomId) => ({
        method: "GET",
        url: `/chat/rooms/${roomId}/messages`,
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
  useCreateWsTicketMutation,
  useCreateChatRoomMutation,
  useLazyGetProductChatRoomQuery,
  useLazyGetChatRoomMessagesQuery,
} = backendApi
