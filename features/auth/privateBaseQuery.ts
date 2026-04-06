import { BaseQueryApi } from "@reduxjs/toolkit/query"
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react"
import { isAxiosError } from "axios"
import { PrivateAxiosRequestConfig, privateApi } from "@/features/auth/privateApi"

type AxiosBaseQueryArgs = {
    body?: FetchArgs["body"]
    headers?: FetchArgs["headers"]
    method?: FetchArgs["method"]
    params?: FetchArgs["params"]
    url: string
}

type AxiosBaseQueryRequestConfig = PrivateAxiosRequestConfig & {
    rtkApi: BaseQueryApi
}

function normalizeHeaders(headers?: FetchArgs["headers"]) {
    // RTK Query chap nhan nhieu kieu headers, trong khi Axios merge on dinh nhat voi object thuong.
    // RTK Query cho phép nhiều kiểu headers khác nhau.
    if (!headers) {
        return undefined
    }

    if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries())
    }

    if (Array.isArray(headers)) {
        return Object.fromEntries(headers)
    }

    return headers
}

function toBaseQueryError(error: unknown): FetchBaseQueryError {
    if (isAxiosError(error)) {
        if (error.response) {
            return {
                status: error.response.status,
                data: error.response.data ?? error.message,
            }
        }

        return {
            // Khong co HTTP response: day thuong la loi mang, CORS, DNS hoac timeout.
            status: "FETCH_ERROR",
            error: error.message,
        }
    }

    return {
        status: "FETCH_ERROR",
        error: error instanceof Error ? error.message : "Unknown error",
    }
}

function getRequestConfig(args: string | FetchArgs, api: BaseQueryApi): AxiosBaseQueryArgs & {
    rtkApi: BaseQueryApi
} {
    // Chuan hoa moi kieu input cua RTK Query ve mot shape duy nhat truoc khi dua cho Axios.
    // Chuẩn hóa input của RTK Query thành một shape duy nhất trước khi đưa cho Axios.
    if (typeof args === "string") {
        return {
            url: args,
            rtkApi: api,
        }
    }

    return {
        url: args.url,
        method: args.method,
        params: args.params,
        body: args.body,
        headers: args.headers,
        rtkApi: api,
    }
}

export const privateBaseQuery: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    // Auth flow nam trong Axios interceptor; file nay chi dong vai tro cau noi RTK Query <-> Axios.
    void extraOptions

    try {
        const requestConfig = getRequestConfig(args, api)
        const axiosRequestConfig: AxiosBaseQueryRequestConfig = {
            url: requestConfig.url,
            method: requestConfig.method,
            params: requestConfig.params,
            data: requestConfig.body,
            headers: normalizeHeaders(requestConfig.headers),
            // Truyen RTK Query api xuong interceptor de co the dispatch khi phien het han.
            rtkApi: requestConfig.rtkApi,
        }
        const response = await privateApi.request(axiosRequestConfig)

        return { data: response.data }
    } catch (error) {
        return {
            error: toBaseQueryError(error),
        }
    }
}
