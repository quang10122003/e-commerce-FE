import { setLoginSession } from "@/server/auth-session"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams

    const userId = searchParams.get("userId")
    const email = searchParams.get("email")
    const fullName = searchParams.get("fullName")
    const role = searchParams.get("role")
    const jwt = searchParams.get("jwt")
    const accessToken = searchParams.get("accessToken")
    const refreshToken = searchParams.get("refreshToken")
    const tokenType = searchParams.get("tokenType")

    const finalUrl = new URL("/oauth2/callback", request.url)

    if (!userId || !email || !role || !accessToken || !refreshToken) {
        finalUrl.searchParams.set("error", "INVALID_GOOGLE_CALLBACK")
        return NextResponse.redirect(finalUrl)
    }

    // Chi con thong tin user tren URL cuoi cung, KHONG con token
    finalUrl.searchParams.set("email", email)
    finalUrl.searchParams.set("fullName", fullName ?? "")
    finalUrl.searchParams.set("role", role)
    finalUrl.searchParams.set("userId", userId)

    const response = NextResponse.redirect(finalUrl)


    // Dung LAI setLoginSession y het co che login thuong, khong viet ham moi
    setLoginSession(response, {
        userId: Number(userId),
        email,
        fullName: fullName ?? "",
        role,
        jwt: jwt ?? "",
        accessToken,
        refreshToken,
        tokenType: tokenType ?? "Bearer",
    })

    return response
}