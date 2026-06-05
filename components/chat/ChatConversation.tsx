"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"

import { useChatRoom } from "@/client/socket/chat/useChatRoom"
import ChatMessageBubble from "@/components/chat/ChatMessageBubble"
import Container from "@/components/shared/Container"
import { useNotification } from "@/components/ui/NotificationProvider"
import { formatCurrency } from "@/lib/format"
import type { ChatRoom } from "@/types/chat/chat"
import type { ProductDetail } from "@/types/product/productDeteilType"

type ChatConversationProps = {
  initialRoom: ChatRoom
  product: ProductDetail | null
}

export default function ChatConversation({ initialRoom, product }: ChatConversationProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [message, setMessage] = useState("")
  const { showNotification } = useNotification()
  const handleError = useCallback(
    (errorMessage: string) => showNotification(errorMessage, { variant: "error" }),
    [showNotification]
  )
  const { isBusy, messages, openRoom, room, socketStatus, submitMessage } = useChatRoom({
    active: true,
    initialRoom,
    onError: handleError,
    roomId: initialRoom.id,
  })

  useEffect(() => {
    void openRoom(initialRoom)
  }, [initialRoom, openRoom])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" })
  }, [messages])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const wasSent = await submitMessage(message)
    if (wasSent) {
      setMessage("")
    }
  }

  const currentRoom = room ?? initialRoom
  const lastMessageSender = currentRoom.lastMessageSenderName ?? "He thong"
  const lastMessageContent = currentRoom.lastMessageContent ?? "Chua co tin nhan."

  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <div className="space-y-6">
        <section className="surface-primary px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Quay lai danh sach chat
              </Link>
              <h1 className="mt-3 truncate text-[28px] font-bold text-slate-950">
                {currentRoom.productName}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-border bg-white px-3 py-1 font-medium text-slate-600">
                  Room #{currentRoom.id}
                </span>
                <span className="rounded-full border border-border bg-white px-3 py-1 font-medium text-slate-600">
                  Product #{currentRoom.productId}
                </span>
                <span className="rounded-full border border-border bg-white px-3 py-1 font-medium text-slate-600">
                  {currentRoom.adminName ? `Nhan vien: ${currentRoom.adminName}` : "Chua gan nhan vien"}
                </span>
              </div>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <span className="relative flex size-2.5" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              Online
            </div>
          </div>
        </section>

        <section className="flex h-[80vh] min-h-0 flex-col overflow-hidden rounded-[16px] border border-border bg-white shadow-[var(--shadow-surface)] lg:grid lg:grid-cols-[320px_1fr]">
          <aside className="max-h-[28vh] shrink-0 overflow-y-auto border-b border-border bg-surface-secondary p-5 lg:max-h-none lg:border-b-0 lg:border-r">
            <Link
              href={`/products/${currentRoom.productId}`}
              className="block rounded-[12px] border border-border bg-white p-4 transition hover:border-[#bfd2f6] hover:bg-primary-soft/60"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">San pham</p>
              <div className="mt-4 flex gap-3">
                <div
                  className="flex size-18 shrink-0 items-center justify-center rounded-[12px] border border-border bg-slate-100 bg-cover bg-center text-sm font-bold text-slate-400"
                  style={{ backgroundImage: product?.thumbnail ? `url(${product.thumbnail})` : undefined }}
                  aria-hidden="true"
                >
                  {!product?.thumbnail ? currentRoom.productName.slice(0, 2).toUpperCase() : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950">
                    {product?.name ?? currentRoom.productName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Nhan de cuoc tro chuyen</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Gia</span>
                  <span className="font-semibold text-primary">
                    {product ? formatCurrency(product.price) : "Dang cap nhat"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Danh muc</span>
                  <span className="truncate font-medium text-slate-700">
                    {product?.nameCategory ?? "Dang cap nhat"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Ton kho</span>
                  <span className="font-medium text-slate-700">
                    {product ? `${product.stock} san pham` : "Dang cap nhat"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Ma san pham</span>
                  <span className="font-medium text-slate-700">#{currentRoom.productId}</span>
                </div>
              </div>
              <p className="mt-3 text-xs font-semibold text-primary">Xem chi tiet san pham</p>
            </Link>

            <div className="mt-4 rounded-[12px] border border-border bg-white p-4">
              <p className="text-sm font-semibold text-slate-950">Tin gan nhat</p>
              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <p className="text-xs font-medium text-slate-500">Nguoi gui</p>
                  <p className="mt-1 font-semibold text-slate-800">{lastMessageSender}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Noi dung</p>
                  <p className="mt-1 leading-6 text-slate-700">{lastMessageContent}</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex min-h-0 flex-col">
            <header className="border-b border-border px-5 py-4">
              <p className="text-sm font-semibold text-slate-950">Noi dung trao doi</p>
              <p className="mt-1 text-sm text-slate-500">
                Tin nhan va trang thai da doc duoc cap nhat realtime.
              </p>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 px-5 py-5">
              {messages.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-border bg-white px-4 py-6 text-center text-sm text-slate-500">
                  Chua co tin nhan trong cuoc tro chuyen nay.
                </div>
              ) : (
                messages.map((chatMessage) => (
                  <ChatMessageBubble
                    key={chatMessage.id}
                    isOwnMessage={chatMessage.senderId === currentRoom.userId}
                    message={chatMessage}
                  />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form className="flex items-center gap-3 border-t border-border bg-white p-4" onSubmit={handleSubmit}>
              <input
                aria-label="Nhap tin nhan"
                className="h-11 min-w-0 flex-1 rounded-[12px] border border-border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isBusy}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Nhap tin nhan..."
                value={message}
              />
              <button
                aria-label="Gui tin nhan"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-primary text-primary-foreground transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!message.trim() || isBusy || socketStatus === "connecting"}
                type="submit"
              >
                <Send className="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </Container>
  )
}
