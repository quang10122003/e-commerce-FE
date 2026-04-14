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
import { useLazyGetCartQuery, useLazyGetMeQuery } from "@/features/auth/tokenApi"
import { setCartTotalQuantity } from "@/features/cart/cartSidebarSlice"

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
    // Dung de lay so luong gio hang ngay sau khi xac thuc thanh cong
    const [getCart] = useLazyGetCartQuery()

    useEffect(() => {
        async function restoreAuth() {
            // Khoa UI auth tam thoi de navbar va modal cho ket qua bootstrap chinh xac
            dispatch(startAuthCheck())

            const accessToken = getAccessToken()
            const refreshToken = getRefreshToken()

            // Neu khong con token nao thi xem nhu da dang xuat hoan toan
            if (!accessToken && !refreshToken) {
                clearAuthenticatedUser(dispatch)
                dispatch(finishAuthCheck())
                return
            }

            try {
                // Xac nhan token con hop le va lay profile moi nhat
                const meResponse = await getMe().unwrap()

                if (meResponse.data) {
                    setAuthenticatedUser(dispatch, meResponse.data)

                    // Fetch so luong gio hang ngay sau khi xac thuc thanh cong
                    // de badge hien thi chinh xac ma khong can mo sidebar truoc
                    try {
                        const cartResponse = await getCart().unwrap()
                        dispatch(setCartTotalQuantity(cartResponse.data?.totalQuantity ?? 0))
                    } catch {
                        // Loi fetch cart khong anh huong den trang thai auth
                        // badge se hien thi khi user mo sidebar lan dau
                    }
                }
            } catch (error) {
                // Chi xoa phien khi server tra ve loi xac thuc ro rang
                // Loi mang tam thoi hoac 5xx khong nen ep nguoi dung dang xuat
                if (isAuthorizationError(error)) {
                    clearAuthenticatedUser(dispatch)
                }
            } finally {
                dispatch(finishAuthCheck())
            }
        }

        restoreAuth()
    }, [dispatch, getMe, getCart])

    return null
}