import { formatDateTime } from "@/lib/format"
import type { ChatMessage } from "@/types/chat/chat"

type ChatMessageBubbleProps = {
  isOwnMessage: boolean
  message: ChatMessage
}

// Hiển thị trạng thái đọc cho tin nhắn của chính người dùng.
function getReadStatusLabel(message: ChatMessage) {
  return message.read ? "Đã đọc" : "Chưa đọc"
}

export default function ChatMessageBubble({
  isOwnMessage,
  message,
}: ChatMessageBubbleProps) {
  if (message.messageType === "SYSTEM") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] ${isOwnMessage ? "text-right" : "text-left"}`}>
        <div
          className={[
            "rounded-[14px] px-4 py-3 text-sm leading-6 shadow-sm",
            isOwnMessage
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-white text-slate-700",
          ].join(" ")}
        >
          {message.content}
        </div>
        <div
          className={[
            "mt-1 flex gap-2 px-1 text-xs text-slate-400",
            isOwnMessage ? "justify-end" : "justify-start",
          ].join(" ")}
        >
          <span>{formatDateTime(message.createdAt)}</span>
          {isOwnMessage ? (
            <span className={message.read ? "font-medium text-emerald-600" : "font-medium text-slate-400"}>
              {getReadStatusLabel(message)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
