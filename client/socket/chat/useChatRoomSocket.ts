// hook này là hook lõi của tính năng chat socket
// - nó lấy ws  ticket để gửi tin nhắn đăng ký toppic connect
// tạo STOMP client
// subscribe topic theo room id
// parse 2 loại event:ChatMessage: tin nhắn mới và ChatReadReceipt: sự kiện đã đọc
// expose sendMessage(content) để publish event gửi tin nhắn 
"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Client, IMessage, StompSubscription } from "@stomp/stompjs"

import { useCreateWsTicketMutation } from "@/client/api/backend-api"
import { createChatStompClient } from "@/client/socket/createChatStompClient"
import type { ChatMessage, ChatReadReceipt } from "@/types/chat/chat"

type SocketStatus = "idle" | "connecting" | "connected" | "error"

type Options = {
  roomId?: number | null
  roomIds?: number[]
  onMessage: (message: ChatMessage) => void
  onReadReceipt?: (receipt: ChatReadReceipt) => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

// Kiểm tra payload socket có phải message hợp lệ không.
function isChatMessage(value: unknown): value is ChatMessage {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.roomId === "number" &&
    typeof value.content === "string"
  )
}

// Backend có thể gửi type hoặc eventType tùy phiên bản API.
function getSocketEventType(value: Record<string, unknown>) {
  return typeof value.type === "string"
    ? value.type
    : typeof value.eventType === "string"
      ? value.eventType
      : null
}

// Parse sự kiện read receipt để cập nhật trạng thái đã đọc realtime.
function toReadReceipt(value: unknown): ChatReadReceipt | null {
  if (!isRecord(value)) {
    return null
  }

  const eventType = getSocketEventType(value)
  if (eventType !== "MESSAGES_READ" && eventType !== "CHAT_MESSAGES_READ") {
    return null
  }

  const payload = isRecord(value.data) ? value.data : value
  if (typeof payload.roomId !== "number") {
    return null
  }

  const messageIds = Array.isArray(payload.messageIds)
    ? payload.messageIds.filter((messageId): messageId is number => typeof messageId === "number")
    : []

  if (messageIds.length === 0) {
    return null
  }

  return {
    messageIds,
    readAt: typeof payload.readAt === "string" ? payload.readAt : undefined,
    readerId: typeof payload.readerId === "number" ? payload.readerId : null,
    roomId: payload.roomId,
  }
}

// Parse message realtime, hỗ trợ cả payload trực tiếp và wrapper { data }.
function toChatMessage(value: unknown): ChatMessage | null {
  if (isChatMessage(value)) {
    return value
  }

  if (!isRecord(value)) {
    return null
  }

  return isChatMessage(value.data) ? value.data : null
}

// Hook socket tổng: subscribe một room hoặc nhiều room và publish message cho room đang mở.
export function useChatRoomSocket({ roomId, roomIds, onMessage, onReadReceipt }: Options) {
  // Danh sách room thực sự cần subscribe, được sort để dependency ổn định.
  const activeRoomIds = useMemo(() => {
    if (roomIds) {
      return [...new Set(roomIds)].sort((a, b) => a - b)
    }

    return roomId ? [roomId] : []
  }, [roomId, roomIds])

  const activeRoomIdsKey = activeRoomIds.join(",")
  // Giữ STOMP client để publish và cleanup khi đổi room/unmount.
  const clientRef = useRef<Client | null>(null)
  // Ref callback giúp socket luôn gọi handler mới nhất mà không reconnect vì render.
  const onMessageRef = useRef(onMessage)
  const onReadReceiptRef = useRef(onReadReceipt)
  // Lưu các subscription để unsubscribe đúng topic khi cleanup.
  const subscriptionRefs = useRef<StompSubscription[]>([])
  const [status, setStatus] = useState<SocketStatus>("idle")
  const [createWsTicket] = useCreateWsTicketMutation()

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    onReadReceiptRef.current = onReadReceipt
  }, [onReadReceipt])

  useEffect(() => {
    const roomIdsToSubscribe = activeRoomIdsKey
      ? activeRoomIdsKey.split(",").map((value) => Number(value))
      : []

    if (roomIdsToSubscribe.length === 0) {
      setStatus("idle")
      return
    }

    let disposed = false

    // Tạo ws-ticket rồi kết nối STOMP và subscribe các topic room.
    async function connect() {
      try {
        setStatus("connecting")

        const ticketResponse = await createWsTicket().unwrap()
        const wsTicket = ticketResponse.data

        if (!wsTicket) {
          throw new Error("Khong tao duoc ws-ticket")
        }

        if (disposed) {
          return
        }

        const client = createChatStompClient({
          ticket: wsTicket.ticket,
          onConnect: () => {
            if (disposed) {
              return
            }

            setStatus("connected")
            subscriptionRefs.current = roomIdsToSubscribe.map((activeRoomId) =>
              client.subscribe(`/topic/chat/rooms/${activeRoomId}`, (frame: IMessage) => {
                const payload = JSON.parse(frame.body) as unknown
                const readReceipt = toReadReceipt(payload)

                if (readReceipt) {
                  onReadReceiptRef.current?.(readReceipt)
                  return
                }

                const message = toChatMessage(payload)
                if (message) {
                  onMessageRef.current(message)
                }
              })
            )
          },
          onError: () => {
            if (!disposed) {
              setStatus("error")
            }
          },
        })

        clientRef.current = client
        client.activate()
      } catch {
        if (!disposed) {
          setStatus("error")
        }
      }
    }

    void connect()

    return () => {
      disposed = true
      subscriptionRefs.current.forEach((subscription) => subscription.unsubscribe())
      subscriptionRefs.current = []
      void clientRef.current?.deactivate()
      clientRef.current = null
    }
  }, [activeRoomIdsKey, createWsTicket])

  const sendMessage = useCallback(
    (content: string) => {
      if (!roomId || !clientRef.current?.connected) {
        return false
      }

      clientRef.current.publish({
        body: JSON.stringify({ content }),
        destination: `/api/chat/rooms/${roomId}/send`,
      })

      return true
    },
    [roomId]
  )

  return { sendMessage, status }
}
