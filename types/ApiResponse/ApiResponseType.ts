export interface ApiErrorType {
    errorCode: string
    message: string
}

export interface ApiResponseType<T> {
    success: boolean
    message: string
    data: T | null
    error: ApiErrorType | null
    timestamp: string
}
export interface PagedResponseType<T> {
    items: T[]
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
}
