"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/app/hooks"
import {
    clearAuthenticatedUser,
    finishAuthCheck,
    setAuthenticatedUser,
    startAuthCheck,
} from "@/features/auth/authSlice"
import { getAccessToken, getRefreshToken } from "@/features/auth/authStorage"
import { useLazyGetMeQuery } from "@/features/auth/tokenApi"

function isAuthorizationError(error: unknown) {
    if (!error || typeof error !== "object" || !("status" in error)) {
        return false
    }

    const status = (error as { status?: unknown }).status

    return status === 401 || status === 403
}

export default function SessionBootstrap() {
    const dispatch = useAppDispatch()
    const [getMe] = useLazyGetMeQuery()

    useEffect(() => {
        async function restoreAuth() {
            // Khoa UI auth tam thoi de navbar va modal cho ket qua bootstrap chinh xac.
            dispatch(startAuthCheck())

            const accessToken = getAccessToken()
            const refreshToken = getRefreshToken()

            // Neu local storage khong con bat ky token nao thi xem nhu da dang xuat hoan toan.
            if (!accessToken && !refreshToken) {
                clearAuthenticatedUser(dispatch)
                dispatch(finishAuthCheck())
                return
            }

            try {
                // /auth/me la diem su that de xac nhan token con hop le va lay profile moi nhat.
                const meResponse = await getMe().unwrap()

                if (meResponse.data) {
                    setAuthenticatedUser(dispatch, meResponse.data)
                }
            } catch (error) {
                // Chi xoa phien khi server tra ve loi xac thuc ro rang.
                // Loi mang tam thoi hoac loi 5xx khong nen ep nguoi dung bi dang xuat.
                // Chỉ xóa phiên khi server trả về lỗi xác thực rõ ràng.
                // Lỗi mạng hoặc lỗi 5xx tạm thời không nên làm người dùng bị đăng xuất ngay.
                if (isAuthorizationError(error)) {
                    clearAuthenticatedUser(dispatch)
                }
            } finally {
                dispatch(finishAuthCheck())
            }
        }

        restoreAuth()
    }, [dispatch, getMe])

    return null
}