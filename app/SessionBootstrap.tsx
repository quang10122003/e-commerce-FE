"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/app/hooks"
import { useLazyGetMeQuery } from "@/client/api/backend-api"
import { openLogin } from "@/client/session/loginModalSlice"
import { pushPendingRedirectUrl } from "@/client/session/redirect-stack"
import {
    clearAuthenticatedUser,
    finishAuthCheck,
    setAuthenticatedUser,
    startAuthCheck,
} from "@/client/session/sessionSlice"
import type { CurrentUserResponse } from "@/types/Auth/CurrentUserResponse"

type SessionBootstrapProps = {
    hasSessionCookie: boolean
    initialUser: CurrentUserResponse | null
}

function isAuthorizationError(error: unknown) {
    if (!error || typeof error !== "object" || !("status" in error)) {
        return false
    }

    const status = (error as { status?: unknown }).status

    return status === 401 || status === 403
}

export default function SessionBootstrap({ hasSessionCookie, initialUser }: SessionBootstrapProps) {
    const dispatch = useAppDispatch()
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [getMe] = useLazyGetMeQuery()
    useEffect(() => {
        async function restoreAuth() {
            // Giữ cho navbar , modal xác thực hoạt động ổn định và nhất quán trong khi phiên cookie trên server đang được kiểm tra.
            dispatch(startAuthCheck())

            // nếu có thông tin user
            if (initialUser) {
                // set user và xác nhận authencation vào store
                setAuthenticatedUser(dispatch, initialUser)
                // check point check auth kết thúc
                dispatch(finishAuthCheck())
                return
            }
            // nếu ko có cooki thì xóa thông tin user và authencation khỏi store
            if (!hasSessionCookie) {
                clearAuthenticatedUser(dispatch)
                dispatch(finishAuthCheck())
                return
            }

            // nếu ko có thông tin user mà lại có cokkki token thì tiến hành lấy thông tin user 
            try {
                // auth/me đi qua proxy của Next, vì vậy việc khôi phục refresh - token sẽ được xử lý ở phía server.
                const meResponse = await getMe().unwrap()

                if (meResponse.data) {
                    setAuthenticatedUser(dispatch, meResponse.data)
                }
            } catch (error) {
                if (isAuthorizationError(error)) {
                    clearAuthenticatedUser(dispatch)
                }
            } finally {
                dispatch(finishAuthCheck())
            }
        }

        restoreAuth()
    }, [dispatch, getMe, hasSessionCookie, initialUser])

    useEffect(() => {
        if (searchParams.get("auth") !== "login") {
            return
        }

        const nextPath = searchParams.get("next")

        pushPendingRedirectUrl(nextPath ?? pathname)
        dispatch(openLogin())

        if (pathname === "/") {
            router.replace("/")
        }
    }, [dispatch, pathname, router, searchParams])

    return null
}
