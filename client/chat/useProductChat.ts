"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  useCreateChatRoomMutation,
  useLazyGetChatRoomMessagesQuery,
  useLazyGetProductChatRoomQuery,
} from "@/client/api/backend-api"
import { useChatRoomSocket } from "@/client/chat/useChatRoomSocket"
import { extractErrorMessage } from "@/lib/error"
import { ChatMessage, ChatRoom } from "@/types/chat/chat"

type UseProductChatOptions = {
  onError: (message: string) => void
  productId: number
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 404
  )
}

function appendUniqueMessage(currentMessages: ChatMessage[], message: ChatMessage) {
  if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) {
    return currentMessages
  }

  return [...currentMessages, message]
}

export function useProductChat({ onError, productId }: UseProductChatOptions) {
 // Lưu tạm message trong lúc room/socket chưa sẵn sàng để gửi realtime.
  const pendingMessageRef = useRef<string | null>(null)
  // state lưu room hiện tại 
  const [room, setRoom] = useState<ChatRoom | null>(null)
  // danh sách các tin nhắn của room 
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // lấy  room của user với sản phẩm 
  const [getProductChatRoom, { isFetching: isCheckingRoom }] = useLazyGetProductChatRoomQuery()

  // lấy tn của room
  const [getChatRoomMessages, { isFetching: isFetchingMessages }] = useLazyGetChatRoomMessagesQuery()
// tạo room 
  const [createChatRoom, { isLoading: isCreatingRoom }] = useCreateChatRoomMutation()

  // Thêm message vào list nếu message chưa tồn tại
  const handleSocketMessage = useCallback((nextMessage: ChatMessage) => {
    setMessages((currentMessages) => appendUniqueMessage(currentMessages, nextMessage))
  }, [])

  // kết nối wedsocket kèm theo đăng ký nắng nghe sự kiện từ topic và add tin nhắn mới vào state messages
  const { sendMessage, status } = useChatRoomSocket({
    onMessage: handleSocketMessage,
    roomId: room?.id ?? null,
  })


  // lâys tin nhắn từ room
  const loadRoomMessages = useCallback(
    async (roomId: number) => {
      const response = await getChatRoomMessages(roomId).unwrap()

      if (response.success && response.data) {
        setMessages(response.data)
      }
    },
    [getChatRoomMessages]
  )

  const openChat = useCallback(async () => {
    if (room) {
      return
    }

    try {
      // lấy room
      const response = await getProductChatRoom(productId).unwrap()

      // nếu có room thì load tin nhắn
      if (response.success && response.data) {
        setRoom(response.data)
        await loadRoomMessages(response.data.id)
      }
    } catch (error) {
      // nếu trả về lỗi khác k tìm thấy room thì bắn thông báo
      if (!isNotFoundError(error)) {
        onError(extractErrorMessage(error))
      }
    }
  }, [getProductChatRoom, loadRoomMessages, onError, productId, room])

  const submitMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim()

      if (!trimmedContent) {
        return false
      }

      if (room) {
        // chưa connect wedsocket 
        if (!sendMessage(trimmedContent)) {
          pendingMessageRef.current = trimmedContent
        }

        return true
      }

      // tạo room nếu chưa có room 
      try {
        const response = await createChatRoom(productId).unwrap()

        if (!response.success || !response.data) {
          return false
        }

        pendingMessageRef.current = trimmedContent
        setRoom(response.data)

        await loadRoomMessages(response.data.id)

        return true
      } catch (error) {
        onError(extractErrorMessage(error))
        return false
      }
    },
    [createChatRoom, loadRoomMessages, onError, productId, room, sendMessage]
  )

  useEffect(() => {
    if (status !== "connected" || !pendingMessageRef.current) {
      return
    }

    const pendingMessage = pendingMessageRef.current

    // gửi tin nhắn
    if (sendMessage(pendingMessage)) {
      pendingMessageRef.current = null
    }
  }, [sendMessage, status])

  return {
    isBusy: isCheckingRoom || isCreatingRoom || isFetchingMessages,
    messages,
    openChat,
    room,
    socketStatus: status,
    submitMessage,
  }
}
