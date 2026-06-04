"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { useChatInbox } from "@/client/socket/useChatInbox"
import Container from "@/components/shared/Container"
import { useNotification } from "@/components/ui/NotificationProvider"
import type { ChatRoom } from "@/types/chat/chat"

type ChatRoomListProps = {
  errorMessage: string | null
  rooms: ChatRoom[]
}

function formatRoomTime(value: string | null) {
  if (!value) return "Chua co tin nhan"

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

function getLastMessage(room: ChatRoom) {
  if (room.lastMessageType === "SYSTEM") {
    return room.lastMessageContent ?? "Cap nhat tu he thong"
  }

  if (!room.lastMessageContent) {
    return "Bat dau trao doi ve san pham nay."
  }

  const sender = room.lastMessageSenderName ? `${room.lastMessageSenderName}: ` : ""

  return `${sender}${room.lastMessageContent}`
}

export default function ChatRoomList({ errorMessage, rooms: initialRooms }: ChatRoomListProps) {
  const { showNotification } = useNotification()
  const { rooms } = useChatInbox({
    initialRooms,
    onError: (message) => showNotification(message, { variant: "error" }),
  })

  return (
    <Container className="py-6 sm:py-8 lg:py-10">
      <div className="space-y-6">
        <section className="surface-primary px-5 py-6 sm:px-6">
          <p className="section-kicker">Chat</p>
          <div className="mt-2 space-y-2">
            <h1 className="text-[30px] font-bold tracking-[-0.03em] text-slate-950">
              Trung tam chat
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Theo doi cac trao doi voi shop theo tung san pham va quay lai dung cuoc tro chuyen khi can.
            </p>
          </div>
        </section>

        {errorMessage ? (
          <div className="surface-primary px-6 py-16 text-center">
            <p className="text-base font-semibold text-slate-950">Khong the tai danh sach chat</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Vui long thu lai sau it phut nua.
            </p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="surface-primary px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-[12px] border border-border bg-primary-soft text-primary">
              <MessageCircle className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-950">Chua co cuoc tro chuyen</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Khi ban chat voi shop tu trang san pham, cac cuoc tro chuyen se xuat hien tai day.
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            <div className="surface-primary px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Tat ca doan chat</p>
                  <p className="mt-1 text-sm text-slate-500">{rooms.length} cuoc tro chuyen</p>
                </div>
                <span className="w-fit rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                  Sap xep theo hoat dong gan nhat
                </span>
              </div>
            </div>

            <div className="grid max-h-[80vh] gap-4 overflow-y-auto pr-1">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="surface-primary group flex gap-4 px-5 py-4 transition-colors hover:border-[#bfd2f6] hover:bg-primary-soft/70 sm:px-6"
                >
                  <div className="relative flex size-12 shrink-0 items-center justify-center rounded-[12px] border border-border bg-white text-primary">
                    <MessageCircle className="size-5" aria-hidden="true" />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white bg-emerald-500"
                      aria-label="Online"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 group-hover:text-primary">
                          {room.productName}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                          <span>{room.adminName ? `Ho tro boi ${room.adminName}` : "Shop online"}</span>
                        </div>
                      </div>
                      <time className="shrink-0 text-xs font-medium text-slate-500">
                        {formatRoomTime(room.lastMessageAt ?? room.createdAt)}
                      </time>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm text-slate-600">
                        {getLastMessage(room)}
                      </p>
                      {room.unreadCount > 0 ? (
                        <span className="inline-flex min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                          {room.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Container>
  )
}
