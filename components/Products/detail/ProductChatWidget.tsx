"use client"

import React, { useCallback, useEffect, useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useProductChat } from "@/client/chat/useProductChat"
import { openLogin } from "@/client/session/loginModalSlice"
import { pushPendingRedirectUrl } from "@/client/session/redirect-stack"
import CardChatProduct from "@/components/Products/detail/CardChatProduct"
import { useNotification } from "@/components/ui/NotificationProvider"
import { formatCurrency } from "@/lib/format"
import { getCurrentBrowserRoute } from "@/lib/navigation"
import { ProductDetail } from "@/types/product/productDeteilType"

type ProductChatWidgetProps = {
  product: ProductDetail
}

export default function ProductChatWidget({ product }: ProductChatWidgetProps) {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  // state mở popup chat
  const [isOpen, setIsOpen] = useState(false)
  // state quản lý nội dung nhập
  const [message, setMessage] = useState("")

  const { showNotification } = useNotification()
  // Giữ callback báo lỗi ổn định giữa các lần render.
  // Nếu truyền trực tiếp arrow function vào hook, dependency trong useProductChat có thể đổi liên tục.
  const handleChatError = useCallback(
    (errorMessage: string) => {
      showNotification(errorMessage, {
        variant: "error",
      })
    },
    [showNotification]
  )

  const { isBusy, messages, openChat, socketStatus, submitMessage ,room,checkChatRoom} = useProductChat({
    isOpen,
    onError: handleChatError,
    productId: product.id,
  })
  // lấy room để render số tin nhắn chưa đọc trong wiget 
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    void checkChatRoom()
  }, [checkChatRoom, isAuthenticated])
  
  const unreadCount = room?.unreadCount ?? 0

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const wasSent = await submitMessage(message)

    if (wasSent) {
      setMessage("")
    }
  }

  const handleOpenChat = () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    if (!isAuthenticated) {
      // Chưa đăng nhập thì chỉ mở form login, không mở chi tiết chat.
      pushPendingRedirectUrl(getCurrentBrowserRoute())
      dispatch(openLogin())
      return
    }

    setIsOpen(true)
    void openChat()
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end sm:bottom-6 sm:right-6">
      <div
        className={[
          "relative mb-4 origin-bottom-right transition-all duration-300 ease-out",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        ].join(" ")}
      >
        <section
          aria-label="Cua so chat ho tro"
          aria-hidden={!isOpen}
          className="flex h-[min(72vh,460px)] w-[min(calc(100vw-2.5rem),360px)] flex-col overflow-hidden rounded-[16px] border border-border bg-white shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
        >
          <header className="flex items-center justify-between gap-3 bg-[#ee4d2d] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Chat voi MyShop</p>
              <p className="truncate text-xs text-white/85">{product.name}</p>
            </div>
            <button
              aria-label="Dong chat"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          <div className="border-b border-border bg-[#fff7f4] px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="size-12 shrink-0 rounded-[12px] border border-[#ffd4c8] bg-white bg-cover bg-center"
                style={{ backgroundImage: product.thumbnail ? `url(${product.thumbnail})` : undefined }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
                <p className="text-xs text-slate-500">${formatCurrency(product.price)}</p>
              </div>
            </div>
          </div>

          <CardChatProduct messages={messages} room={room} isOpen={isOpen} />

          <form className="flex items-center gap-2 border-t border-border bg-white p-3" onSubmit={handleSubmit}>
            <input
              aria-label="Nhap tin nhan"
              className="h-10 min-w-0 flex-1 rounded-full border border-border bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#ee4d2d] focus:bg-white focus:ring-4 focus:ring-[#ffe1d8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Nhap tin nhan..."
              value={message}
            />
            <button
              aria-label="Gui tin nhan"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ee4d2d] text-white transition hover:bg-[#d94326] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!message.trim() || isBusy || socketStatus === "connecting"}
              type="submit"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        <div
          aria-hidden="true"
          className="absolute -bottom-3.25 right-13 h-0 w-0 border-x-13 border-t-13 border-x-transparent border-t-border"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-2.75 right-13 h-0 w-0 border-x-12 border-t-12 border-x-transparent border-t-white drop-shadow-[0_6px_8px_rgba(15,23,42,0.06)]"
        />
      </div>

      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Thu gon chat ho tro" : "Mo chat ho tro"}
        className={[
          "relative inline-flex items-center gap-2 rounded-full bg-[#ee4d2d] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(238,77,45,0.32)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#d94326] focus:outline-none focus:ring-4 focus:ring-[#f8b4a3]",
          isOpen ? "ring-4 ring-[#f8b4a3]/70" : "",
        ].join(" ")}
        onClick={handleOpenChat}
        type="button"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        <span>Chat</span>
        {!isOpen && unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
    </div>
  )
}
