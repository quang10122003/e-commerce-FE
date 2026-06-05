// ── Hook ──────────────────────────────────────────────────────────────────────

// Hook lắng nghe sự kiện thanh toán realtime qua STOMP WebSocket.
//
// Flow hoạt động:
// 1. Lấy ws-ticket từ backend (ticket có thời hạn ngắn, dùng 1 lần).
// 2. Tạo STOMP client bằng createChatStompClient (dùng chung hạ tầng với chat).
// 3. Sau khi connect, subscribe topic /topic/payment/{orderCode}.
// 4. Parse từng frame nhận được, dispatch về đúng callback theo status.
// 5. Với SUCCESS, PAID_LATE, DUPLICATE_PAYMENT: deactivate client sau khi xử lý vì không cần lắng nghe tiếp.
// 6. Với AMOUNT_MISMATCH: giữ kết nối để có thể nhận lại nếu khách thử chuyển lại.
// 7. Cleanup khi orderCode đổi hoặc component unmount: unsubscribe + deactivate.
"use client"

import { useEffect, useRef, useState } from "react"
import type { Client, StompSubscription } from "@stomp/stompjs"
import { createChatStompClient } from "@/client/socket/createChatStompClient"
import { useCreateWsTicketMutation } from "@/client/api/backend-api"

// ── Types ─────────────────────────────────────────────────────────────────────

// Trạng thái kết nối WebSocket nội bộ của hook.
// - idle: chưa khởi tạo (orderCode null hoặc chưa mount)
// - connecting: đang lấy ticket và kết nối STOMP
// - connected: đã subscribe topic thành công
// - error: lấy ticket thất bại hoặc STOMP báo lỗi
type PaymentSocketStatus = "idle" | "connecting" | "connected" | "error"

// Các trạng thái thanh toán backend có thể bắn về qua WebSocket.
// - SUCCESS: khách chuyển khoản đúng số tiền, đúng hạn
// - AMOUNT_MISMATCH: khách chuyển sai số tiền
// - PAID_LATE: khách chuyển đúng tiền nhưng đã quá expiredAt
// - DUPLICATE_PAYMENT: đơn đã được thanh toán trước đó, khách chuyển lại
export type PaymentEventStatus = "SUCCESS" | "AMOUNT_MISMATCH" | "PAID_LATE" | "DUPLICATE_PAYMENT"

// Payload WebSocket backend gửi về cho từng sự kiện thanh toán.
export interface PaymentNotification {
    status: PaymentEventStatus
    orderId: string   // orderCode, dùng để redirect đúng trang
    message: string   // mô tả ngắn để hiển thị hoặc log
}

// Options truyền vào hook — mỗi callback tương ứng 1 trạng thái thanh toán.
type UsePaymentSocketOptions = {
    // orderCode của đơn hàng cần lắng nghe, null khi chưa có đơn.
    orderCode: string | null
    // Gọi khi thanh toán thành công → đóng tab QR, redirect tab gốc.
    onSuccess: (data: PaymentNotification) => void
    // Gọi khi số tiền không khớp → hiển thị cảnh báo, giữ tab QR.
    onAmountMismatch: (data: PaymentNotification) => void
    // Gọi khi thanh toán muộn → hiển thị cảnh báo, cho chat admin.
    onPaidLate: (data: PaymentNotification) => void
    // Gọi khi đơn đã thanh toán trước đó → hiển thị cảnh báo, cho chat admin hoàn tiền.
    onDuplicatePayment: (data: PaymentNotification) => void
}


// Kiểm tra value có phải plain object không — dùng trước khi truy cập key.
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

// Parse payload thô từ WebSocket frame thành PaymentNotification.
// Trả null nếu thiếu field hoặc sai kiểu — tránh crash khi backend đổi schema.
function toPaymentNotification(value: unknown): PaymentNotification | null {
    if (!isRecord(value)) return null

    const { status, orderCode, message } = value

    if (
        typeof status !== "string" ||
        typeof orderCode !== "string" ||
        typeof message !== "string"
    ) return null

    return { status: status as PaymentEventStatus, orderId: orderCode, message }
}


export function usePaymentSocket({
    orderCode,
    onSuccess,
    onAmountMismatch,
    onPaidLate,
    onDuplicatePayment,
}: UsePaymentSocketOptions) {
    // Trạng thái kết nối để component cha có thể hiển thị indicator nếu cần.
    const [socketStatus, setSocketStatus] = useState<PaymentSocketStatus>("idle")

    // Giữ STOMP client để deactivate khi cleanup — không dùng state vì không cần re-render.
    const clientRef = useRef<Client | null>(null)

    // Giữ subscription để unsubscribe đúng topic khi cleanup, tránh nhận event cũ.
    const subscriptionRef = useRef<StompSubscription | null>(null)

    // Ref các callback để luôn gọi phiên bản mới nhất mà không cần reconnect socket
    // khi component re-render (pattern tương tự useChatRoomSocket).
    const onSuccessRef = useRef(onSuccess)
    const onAmountMismatchRef = useRef(onAmountMismatch)
    const onPaidLateRef = useRef(onPaidLate)
    const onDuplicatePaymentRef = useRef(onDuplicatePayment)

    // Đồng bộ ref mỗi khi callback prop thay đổi.
    useEffect(() => { onSuccessRef.current = onSuccess }, [onSuccess])
    useEffect(() => { onAmountMismatchRef.current = onAmountMismatch }, [onAmountMismatch])
    useEffect(() => { onPaidLateRef.current = onPaidLate }, [onPaidLate])
    useEffect(() => { onDuplicatePaymentRef.current = onDuplicatePayment }, [onDuplicatePayment])

    const [createWsTicket] = useCreateWsTicketMutation()

    useEffect(() => {
        // Không kết nối khi chưa có orderCode.
        if (!orderCode) {
            setSocketStatus("idle")
            return
        }

        // Flag để tránh setState sau khi effect đã cleanup (tránh memory leak).
        let disposed = false

        async function connect() {
            try {
                setSocketStatus("connecting")

                // Lấy ws-ticket từ backend — ticket này được ký server-side,
                // dùng để xác thực WebSocket mà không cần truyền JWT trực tiếp.
                const ticketResponse = await createWsTicket().unwrap()
                const wsTicket = ticketResponse.data

                if (!wsTicket) throw new Error("Không tạo được ws-ticket")

                // Nếu effect đã cleanup trong lúc đang await, dừng lại không kết nối.
                if (disposed) return

                const client = createChatStompClient({
                    ticket: wsTicket.ticket,

                    onConnect: () => {
                        if (disposed) return

                        setSocketStatus("connected")

                        // Subscribe topic payment của đơn hàng cụ thể.
                        // Backend gửi message tới đây sau khi xử lý webhook SePay xong.
                        subscriptionRef.current = client.subscribe(
                            `/topic/payment/${orderCode}`,
                            (frame) => {
                                const payload = JSON.parse(frame.body) as unknown
                                const notification = toPaymentNotification(payload)

                                // Bỏ qua frame không parse được — tránh crash UI.
                                if (!notification) {
                                    console.warn("usePaymentSocket: invalid frame", frame.body)
                                    return
                                }

                                switch (notification.status) {
                                    case "SUCCESS":
                                        // Thanh toán thành công — xử lý rồi đóng kết nối,
                                        // không cần lắng nghe thêm.
                                        onSuccessRef.current(notification)
                                        client.deactivate()
                                        break

                                    case "AMOUNT_MISMATCH":
                                        // Số tiền sai — giữ kết nối để nhận lại nếu khách thử chuyển lại.
                                        onAmountMismatchRef.current(notification)
                                        break

                                    case "PAID_LATE":
                                        // Thanh toán muộn — xử lý rồi đóng kết nối.
                                        onPaidLateRef.current(notification)
                                        client.deactivate()
                                        break

                                    case "DUPLICATE_PAYMENT":
                                        // Thanh toán trùng lặp — xử lý rồi đóng kết nối,
                                        // không cần lắng nghe thêm vì đơn đã được xử lý trước đó.
                                        onDuplicatePaymentRef.current(notification)
                                        client.deactivate()
                                        break
                                }
                            }
                        )
                    },

                    onError: () => {
                        if (!disposed) setSocketStatus("error")
                    },
                })

                clientRef.current = client
                client.activate()
            } catch {
                if (!disposed) setSocketStatus("error")
            }
        }

        void connect()

        // Cleanup khi orderCode thay đổi hoặc component unmount.
        // Unsubscribe trước để không nhận thêm frame, sau đó deactivate STOMP.
        return () => {
            disposed = true
            subscriptionRef.current?.unsubscribe()
            subscriptionRef.current = null
            void clientRef.current?.deactivate()
            clientRef.current = null
        }
    }, [orderCode, createWsTicket])

    // Expose socketStatus để component cha hiển thị trạng thái kết nối nếu cần.
    return { socketStatus }
}