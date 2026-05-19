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
            // Keep navbar/auth modal deterministic while the server cookie session is checked.
            dispatch(startAuthCheck())

            if (initialUser) {
                setAuthenticatedUser(dispatch, initialUser)
                dispatch(finishAuthCheck())
                return
            }

            if (!hasSessionCookie) {
                clearAuthenticatedUser(dispatch)
                dispatch(finishAuthCheck())
                return
            }

            try {
                // /auth/me goes through the Next proxy, so refresh-token recovery stays server-side.
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
