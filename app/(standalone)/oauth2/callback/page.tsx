"use client"

import { backendApi } from "@/client/api/backend-api"
import { setAuthenticatedUser } from "@/client/session/sessionSlice"
import Loading from "@/components/shared/Loading"
import { useNotification } from "@/components/ui/NotificationProvider"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useDispatch } from "react-redux"

export default function OAuth2CallbackPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const dispatch = useDispatch()
    const {showNotification} = useNotification()
    useEffect(() => {
        const error = searchParams.get("error")
        if (error) {
            showNotification("Đăng nhập Google thất bại", { variant: "error" })
            router.replace("/login")
            return
        }

        const userId = searchParams.get("userId")
        const email = searchParams.get("email")
        const fullName = searchParams.get("fullName")
        const role = searchParams.get("role")

        if (!userId || !email || !role) {
            showNotification("Đăng nhập Google thất bại", { variant: "error" })
            router.replace("/login")
            return
        }

        // Giong het handleSubmitAuthForm
        setAuthenticatedUser(dispatch, {
            userId: Number(userId),
            email,
            fullName: fullName ?? "",
            role,
        })

        showNotification("Đăng nhập thành công", { variant: "success" })

        dispatch(backendApi.util.resetApiState())

        router.replace("/")
    }, [dispatch, router, searchParams, showNotification])

    return <Loading />
}