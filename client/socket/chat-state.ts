"use client"

import type { ChatMessage, ChatReadReceipt, ChatRoom } from "@/types/chat/chat"

// Nhận diện lỗi 404 khi user chưa có room chat cho sản phẩm.
export function isNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 404
  )
}

// Tin nhắn đến là tin TEXT do phía còn lại gửi trong room hiện tại.
export function isIncomingTextMessage(message: ChatMessage, room: ChatRoom) {
  return message.senderId !== room.userId && message.messageType === "TEXT"
}

// Đánh dấu read ngay trên UI nếu tin nhắn đến đang được người dùng xem.
export function markMessageAsReadIfNeeded(message: ChatMessage, room: ChatRoom) {
  return isIncomingTextMessage(message, room) && !message.read ? { ...message, read: true } : message
}

// Đánh dấu toàn bộ tin nhắn đến trong room là đã đọc.
export function markMessagesAsRead(messages: ChatMessage[], room: ChatRoom) {
  let hasChanged = false

  const nextMessages = messages.map((message) => {
    if (message.read || !isIncomingTextMessage(message, room)) {
      return message
    }

    hasChanged = true
    return { ...message, read: true }
  })

  return hasChanged ? nextMessages : messages
}

// Cập nhật read theo receipt realtime backend broadcast.
export function markMessagesAsReadByReceipt(messages: ChatMessage[], receipt: ChatReadReceipt) {
  const readMessageIds = new Set(receipt.messageIds)
  let hasChanged = false

  const nextMessages = messages.map((message) => {
    if (message.read || !readMessageIds.has(message.id)) {
      return message
    }

    hasChanged = true
    return { ...message, read: true }
  })

  return hasChanged ? nextMessages : messages
}

// Thêm message mới nhưng tránh append trùng khi socket reconnect/bắn lại.
export function appendUniqueMessage(currentMessages: ChatMessage[], message: ChatMessage) {
  if (currentMessages.some((currentMessage) => currentMessage.id === message.id)) {
    return currentMessages
  }

  return [...currentMessages, message]
}

// Giữ nguyên reference nếu payload message không đổi để tránh render thừa.
export function haveSameMessages(currentMessages: ChatMessage[], nextMessages: ChatMessage[]) {
  if (currentMessages.length !== nextMessages.length) {
    return false
  }

  return currentMessages.every((message, index) => {
    const nextMessage = nextMessages[index]

    return (
      message.id === nextMessage?.id &&
      message.content === nextMessage.content &&
      message.messageType === nextMessage.messageType &&
      message.read === nextMessage.read
    )
  })
}

// Đồng bộ preview room từ message mới nhất.
export function applyRoomPreviewMessage(room: ChatRoom, message: ChatMessage) {
  return {
    ...room,
    lastMessageAt: message.createdAt,
    lastMessageContent: message.content,
    lastMessageSenderId: message.senderId,
    lastMessageSenderName: message.senderName,
    lastMessageType: message.messageType,
  }
}

// Sắp xếp room theo hoạt động mới nhất.
export function sortRoomsByRecentActivity(rooms: ChatRoom[]) {
  return [...rooms].sort((a, b) => {
    const aTime = new Date(a.lastMessageAt ?? a.createdAt).getTime()
    const bTime = new Date(b.lastMessageAt ?? b.createdAt).getTime()

    return bTime - aTime
  })
}
