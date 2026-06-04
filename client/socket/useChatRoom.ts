// hook này dùng cho 1 room {chat/roomID} và  widget chat sản phẩm.
// giữ state luồng mở room lấy tin nhắn có trong room
// gọi  read tin nhắn
// khi có event tin nhắn đc gửi đc  thì: 
  // lắng nghe kiểm tra đúng room không
  // append message nếu chưa trùng
  // cập nhật preview room
  // nếu room đang active và tin là từ đối phương thì gọi markRoomMessagesAsRead
"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  useLazyGetChatRoomMessagesQuery,
  useMarkChatRoomAsReadMutation,
} from "@/client/api/backend-api"
import {
  appendUniqueMessage,
  haveSameMessages,
  isIncomingTextMessage,
  markMessageAsReadIfNeeded,
  markMessagesAsRead,
  markMessagesAsReadByReceipt,
} from "@/client/socket/chat-state"
import { useChatRoomSocket } from "@/client/socket/useChatRoomSocket"
import { extractErrorMessage } from "@/lib/error"
import type { ChatMessage, ChatReadReceipt, ChatRoom } from "@/types/chat/chat"

type UseChatRoomOptions = {
  active?: boolean
  initialRoom?: ChatRoom | null
  onError: (message: string) => void
  roomId: number | null
}

// Hook quản lý một room chat: load tin, gửi tin, nhận realtime và đồng bộ read receipt.
export function useChatRoom({ active = true, initialRoom = null, onError, roomId }: UseChatRoomOptions) {
  // activeRef cho biết room đang được mở để quyết định mark-read ngay khi có tin đến.
  const activeRef = useRef(active)
  // Ghi nhớ room đã load message để tránh fetch lại khi mở cùng room.
  const loadedRoomIdRef = useRef<number | null>(null)
  // Lưu tin đang chờ gửi khi socket chưa connected.
  const pendingMessageRef = useRef<string | null>(null)
  // roomRef giúp callback socket đọc room mới nhất mà không phụ thuộc render.
  const roomRef = useRef<ChatRoom | null>(initialRoom)
  const [room, setRoom] = useState<ChatRoom | null>(initialRoom)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [getChatRoomMessages, { isFetching: isFetchingMessages }] = useLazyGetChatRoomMessagesQuery()
  const [markChatRoomAsRead, { isLoading: isMarkingRead }] = useMarkChatRoomAsReadMutation()

  // Gọi API mark-read và cập nhật local state để UI phản hồi ngay.
  const markRoomMessagesAsRead = useCallback(
    async (chatRoom: ChatRoom) => {
      try {
        await markChatRoomAsRead(chatRoom.id).unwrap()

        setMessages((currentMessages) => markMessagesAsRead(currentMessages, chatRoom))
        setRoom((currentRoom) =>
          currentRoom?.id === chatRoom.id && currentRoom.unreadCount !== 0
            ? { ...currentRoom, unreadCount: 0 }
            : currentRoom
        )
      } catch (error) {
        onError(extractErrorMessage(error))
      }
    },
    [markChatRoomAsRead, onError]
  )

  // Load lịch sử tin nhắn của room từ API.
  const loadRoomMessages = useCallback(
    async (nextRoomId: number) => {
      const response = await getChatRoomMessages(nextRoomId).unwrap()

      if (response.success && response.data) {
        const nextMessages = response.data

        loadedRoomIdRef.current = nextRoomId
        setMessages((currentMessages) =>
          haveSameMessages(currentMessages, nextMessages) ? currentMessages : nextMessages
        )
      }
    },
    [getChatRoomMessages]
  )

  // Xử lý message realtime: append, cập nhật preview room và mark-read nếu đang xem.
  const handleSocketMessage = useCallback(
    (nextMessage: ChatMessage) => {
      const currentRoom = roomRef.current

      if (!currentRoom || nextMessage.roomId !== currentRoom.id) {
        return
      }

      let isDuplicate = false
      // Nếu room đang active, tin nhắn đến được xem như đã đọc ngay.
      const shouldMarkAsRead = activeRef.current && isIncomingTextMessage(nextMessage, currentRoom)

      setMessages((currentMessages) => {
        isDuplicate = currentMessages.some((currentMessage) => currentMessage.id === nextMessage.id)

        return appendUniqueMessage(
          currentMessages,
          shouldMarkAsRead ? markMessageAsReadIfNeeded(nextMessage, currentRoom) : nextMessage
        )
      })

      setRoom((current) =>
        current?.id === currentRoom.id
          ? {
              ...current,
              lastMessageAt: nextMessage.createdAt,
              lastMessageContent: nextMessage.content,
              lastMessageSenderId: nextMessage.senderId,
              lastMessageSenderName: nextMessage.senderName,
              lastMessageType: nextMessage.messageType,
              unreadCount:
                isDuplicate || shouldMarkAsRead || !isIncomingTextMessage(nextMessage, currentRoom)
                  ? current.unreadCount
                  : current.unreadCount + 1,
            }
          : current
      )

      if (shouldMarkAsRead) {
        void markRoomMessagesAsRead(currentRoom)
      }
    },
    [markRoomMessagesAsRead]
  )

  // Xử lý receipt khi phía còn lại đọc tin nhắn của mình.
  const handleSocketReadReceipt = useCallback((receipt: ChatReadReceipt) => {
    const currentRoom = roomRef.current

    if (!currentRoom || receipt.roomId !== currentRoom.id) {
      return
    }

    setMessages((currentMessages) => markMessagesAsReadByReceipt(currentMessages, receipt))
  }, [])

  const { sendMessage, status } = useChatRoomSocket({
    onMessage: handleSocketMessage,
    onReadReceipt: handleSocketReadReceipt,
    roomId,
  })

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    roomRef.current = room
  }, [room])

  // Mở room: load message lần đầu và đánh dấu đã đọc.
  const openRoom = useCallback(
    async (nextRoom: ChatRoom) => {
      setRoom(nextRoom)

      if (loadedRoomIdRef.current !== nextRoom.id) {
        await loadRoomMessages(nextRoom.id)
      }

      await markRoomMessagesAsRead(nextRoom)
    },
    [loadRoomMessages, markRoomMessagesAsRead]
  )

  // Gửi tin nhắn; nếu socket chưa sẵn sàng thì lưu vào pending để gửi sau.
  const submitMessage = useCallback(
    async (content: string, targetRoom: ChatRoom | null = room) => {
      const trimmedContent = content.trim()

      if (!trimmedContent || !targetRoom) {
        return false
      }

      if (!sendMessage(trimmedContent)) {
        pendingMessageRef.current = trimmedContent
      }

      return true
    },
    [room, sendMessage]
  )

  // Khi socket connected lại, gửi tin nhắn pending nếu có.
  useEffect(() => {
    if (status !== "connected" || !pendingMessageRef.current) {
      return
    }

    const pendingMessage = pendingMessageRef.current

    if (sendMessage(pendingMessage)) {
      pendingMessageRef.current = null
    }
  }, [sendMessage, status])

  return {
    isBusy: isFetchingMessages || isMarkingRead,
    loadRoomMessages,
    markRoomMessagesAsRead,
    messages,
    openRoom,
    room,
    setRoom,
    socketStatus: status,
    submitMessage,
  }
}
