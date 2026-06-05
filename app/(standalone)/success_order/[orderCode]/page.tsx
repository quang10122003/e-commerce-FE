"use client"

import { Check } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SuccessOrderPage() {
    const router = useRouter()

    const params = useParams<{
        orderCode: string
    }>()

    const orderCode = params.orderCode

    // Tự động chuyển hướng sang trang đơn hàng sau khi hiển thị hiệu ứng.
    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/order")
        }, 5000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="surface-primary success-card w-full max-w-xl p-8 sm:p-12">
                <div className="flex flex-col items-center text-center">

                    {/* Vòng tròn xác nhận thanh toán thành công */}
                    <div className="success-icon-wrapper">
                        <div className="success-ring" />

                        <div className="success-icon">
                            <Check className="success-check h-10 w-10" />
                        </div>
                    </div>

                    {/* Nội dung xác nhận */}
                    <div className="success-content">
                        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-foreground">
                            Thanh toán thành công
                        </h1>

                        <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                            Đơn hàng của bạn đã được xác nhận và đang được xử lý.
                        </p>
                    </div>

                    {/* Mã đơn hàng */}
                    <div className="success-order-code mt-8">
                        <div className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-primary">
                            Mã đơn hàng #{orderCode}
                        </div>
                    </div>

                    {/* Đường phân cách */}
                    <div className="mt-8 h-px w-full bg-border" />

                    {/* Thông báo chuyển hướng */}
                    <p className="mt-6 text-sm text-muted-foreground">
                        Đang chuyển hướng đến trang đơn hàng...
                    </p>
                </div>
            </div>
        </main>
    )
}