"use client"

import { useCallback, useState } from "react"

import {
  useCreateChatRoomMutation,
  useLazyGetProductChatRoomQuery,
} from "@/client/api/backend-api"
import { isNotFoundError } from "@/client/socket/chat/chat-state"
import { useChatRoom } from "@/client/socket/chat/useChatRoom"
import { extractErrorMessage } from "@/lib/error"
import type { ChatRoom } from "@/types/chat/chat"

type UseProductChatOptions = {
  isOpen: boolean
  onError: (message: string) => void
  productId: number
}

// Hook riêng cho widget sản phẩm: tìm/tạo room theo productId rồi dùng useChatRoom bên dưới.
export function useProductChat({ isOpen, onError, productId }: UseProductChatOptions) {
  // initialRoom/roomId được set sau khi backend xác nhận room của sản phẩm.
  const [initialRoom, setInitialRoom] = useState<ChatRoom | null>(null)
  const [roomId, setRoomId] = useState<number | null>(null)
  const [getProductChatRoom, { isFetching: isCheckingRoom }] = useLazyGetProductChatRoomQuery()
  const [createChatRoom, { isLoading: isCreatingRoom }] = useCreateChatRoomMutation()

  const chatRoom = useChatRoom({
    active: isOpen,
    initialRoom,
    onError,
    roomId,
  })
  const {
    isBusy,
    loadRoomMessages,
    messages,
    openRoom,
    room,
    setRoom,
    socketStatus,
    submitMessage: submitRoomMessage,
  } = chatRoom

  // Đồng bộ room vừa lấy/tạo vào cả wrapper và hook room lõi.
  const setResolvedRoom = useCallback(
    (nextRoom: ChatRoom) => {
      setInitialRoom(nextRoom)
      setRoomId(nextRoom.id)
      setRoom(nextRoom)
    },
    [setRoom]
  )

  // Lấy room trước khi mở widget để hiển thị badge unread realtime.
  const checkChatRoom = useCallback(async () => {
    if (room || roomId) {
      return
    }

    try {
      const response = await getProductChatRoom(productId).unwrap()

      if (response.success && response.data) {
        setResolvedRoom(response.data)
      }
    } catch (error) {
      if (!isNotFoundError(error)) {
        onError(extractErrorMessage(error))
      }
    }
  }, [getProductChatRoom, onError, productId, room, roomId, setResolvedRoom])

  // Mở widget: lấy room nếu cần, load messages và mark-read.
  const openChat = useCallback(async () => {
    if (room) {
      await openRoom(room)
      return
    }

    try {
      const response = await getProductChatRoom(productId).unwrap()

      if (response.success && response.data) {
        setResolvedRoom(response.data)
        await openRoom(response.data)
      }
    } catch (error) {
      if (!isNotFoundError(error)) {
        onError(extractErrorMessage(error))
      }
    }
  }, [getProductChatRoom, onError, openRoom, productId, room, setResolvedRoom])

  // Gửi tin từ widget; nếu chưa có room thì tạo room trước.
  const submitMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim()

      if (!trimmedContent) {
        return false
      }

      if (room) {
        return submitRoomMessage(trimmedContent)
      }

      try {
        const response = await createChatRoom(productId).unwrap()

        if (!response.success || !response.data) {
          return false
        }

        setResolvedRoom(response.data)
        await loadRoomMessages(response.data.id)
        return submitRoomMessage(trimmedContent, response.data)
      } catch (error) {
        onError(extractErrorMessage(error))
        return false
      }
    },
    [createChatRoom, loadRoomMessages, onError, productId, room, setResolvedRoom, submitRoomMessage]
  )

  return {
    checkChatRoom,
    isBusy: isCheckingRoom || isCreatingRoom || isBusy,
    messages,
    openChat,
    room,
    socketStatus,
    submitMessage,
  }
}
