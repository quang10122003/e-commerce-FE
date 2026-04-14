import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { ApiResponseType } from "@/types/ApiResponse/ApiResponseType"
// lấy err trả về từ rtk api privite interceptor 
export function extractErrorMessage(error: unknown): string {
    const err = error as FetchBaseQueryError

    const data = err?.data as ApiResponseType<null> | undefined

    return (
        data?.error?.message ??
        data?.message ??
        "Có lỗi xảy ra"
    )
}