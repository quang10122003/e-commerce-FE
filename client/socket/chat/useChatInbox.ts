// Đăng ký lắng nghe sự kiện cho tất cả các room được gửi từ page.
// Khi có message mới:
//   cập nhật lastMessageContent
//   cập nhật lastMessageSenderName
//   cập nhật lastMessageAt
//   sort room mới nhất lên đầu
//   nếu room không active và tin đến từ đối phương thì tăng unreadCount
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useLazyGetChatRoomsQuery } from "@/client/api/backend-api"
import {
  applyRoomPreviewMessage,
  isIncomingTextMessage,
  sortRoomsByRecentActivity,
} from "@/client/socket/chat/chat-state"
import { useChatRoomSocket } from "@/client/socket/chat/useChatRoomSocket"
import { extractErrorMessage } from "@/lib/error"
import type { ChatMessage, ChatReadReceipt, ChatRoom } from "@/types/chat/chat"

type UseChatInboxOptions = {
  activeRoomId?: number | null
  initialRooms: ChatRoom[]
  onError: (message: string) => void
}

// Hook quản lý inbox: danh sách room, preview mới nhất và unread realtime.
export function useChatInbox({ activeRoomId = null, initialRooms, onError }: UseChatInboxOptions) {
  // rooms là state client-side để cập nhật realtime mà không cần reload page.
  const [rooms, setRooms] = useState(() => sortRoomsByRecentActivity(initialRooms))
  const [getChatRooms, { isFetching }] = useLazyGetChatRoomsQuery()

  useEffect(() => {
    setRooms(sortRoomsByRecentActivity(initialRooms))
  }, [initialRooms])

  const refreshRooms = useCallback(async () => {
    try {
      const response = await getChatRooms().unwrap()

      if (response.success && response.data) {
        setRooms(sortRoomsByRecentActivity(response.data))
      }
    } catch (error) {
      onError(extractErrorMessage(error))
    }
  }, [getChatRooms, onError])

  // Tin mới sẽ cập nhật preview, tăng unread nếu room đó không đang mở.
  const handleSocketMessage = useCallback(
    (message: ChatMessage) => {
      setRooms((currentRooms) =>
        sortRoomsByRecentActivity(
          currentRooms.map((room) => {
            if (room.id !== message.roomId) {
              return room
            }

            const isActiveRoom = activeRoomId === room.id
            const shouldIncreaseUnread = !isActiveRoom && isIncomingTextMessage(message, room)

            return {
              ...applyRoomPreviewMessage(room, message),
              unreadCount: shouldIncreaseUnread ? room.unreadCount + 1 : room.unreadCount,
            }
          })
        )
      )
    },
    [activeRoomId]
  )

  // Receipt read sẽ reset unread của room tương ứng trong inbox.
  const handleReadReceipt = useCallback((receipt: ChatReadReceipt) => {
    setRooms((currentRooms) =>
      currentRooms.map((room) =>
        room.id === receipt.roomId && room.unreadCount !== 0 ? { ...room, unreadCount: 0 } : room
      )
    )
  }, [])

  // Hiện tại backend chưa có topic inbox tổng, nên subscribe từng room trong list.
  const roomIds = useMemo(() => rooms.map((room) => room.id), [rooms])
  const { status } = useChatRoomSocket({
    onMessage: handleSocketMessage,
    onReadReceipt: handleReadReceipt,
    roomIds,
  })

  const markRoomReadLocally = useCallback((roomId: number) => {
    setRooms((currentRooms) =>
      currentRooms.map((room) => (room.id === roomId ? { ...room, unreadCount: 0 } : room))
    )
  }, [])

  return {
    isFetching,
    markRoomReadLocally,
    refreshRooms,
    rooms,
    socketStatus: status,
  }
}
