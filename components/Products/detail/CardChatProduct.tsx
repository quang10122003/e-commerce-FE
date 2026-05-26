import { useEffect, useRef, useState, useCallback } from "react"
import { ChatMessage, ChatRoom } from "@/types/chat/chat"

type CardChatProductProps = {
  messages?: ChatMessage[]
  room: ChatRoom | null
  isOpen?: boolean
}

const DEFAULT_MESSAGE = "Xin chào, MyShop có thể hỗ trợ gì cho bạn về sản phẩm này?"

// Ngưỡng px tính là "đang ở cuối" — dùng 150 để UX mượt hơn
const SCROLL_BOTTOM_THRESHOLD = 150

// Hien thi trang thai doc ngan gon cho tin nhan thuong.
function getReadStatusLabel(message: ChatMessage) {
  return message.read ? "Đã đọc" : "Chưa đọc"
}

export default function CardChatProduct({
  messages = [],
  room,
  isOpen = false,
}: CardChatProductProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  /**
   * Dùng ref thay vì state cho các flag nội bộ để tránh re-render thừa.
   * - shouldScrollOnOpenRef: đánh dấu cần scroll xuống cuối lần tới khi popup mở lại
   * - isAtBottomRef: trạng thái hiện tại người dùng có đang ở cuối list không
   */
  const shouldScrollOnOpenRef = useRef(false)
  const isAtBottomRef = useRef(true)

  // Theo dõi số lượng message trước đó để tính delta khi có tin mới
  const prevMessageCountRef = useRef(messages.length)

  // showScrollButton: hiển thị nút "Tin nhắn mới" khi người dùng cuộn lên trên
  // newMessageCount: badge đếm số tin nhắn đến chưa đọc
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [newMessageCount, setNewMessageCount] = useState(0)

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Kiểm tra container hiện có đang ở vị trí cuối không */
  const checkIsAtBottom = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_BOTTOM_THRESHOLD
  }, [])

  /** Cuộn xuống phần tử cuối cùng */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "nearest" })
  }, [])

  // ─── Event handlers ─────────────────────────────────────────────────────────

  /**
   * Xử lý sự kiện scroll:
   * - Cập nhật isAtBottomRef theo vị trí thực tế
   * - Nếu đã xuống cuối → ẩn nút + reset badge
   * - Nếu chưa xuống cuối → hiển thị nút scroll
   */
  const handleScroll = useCallback(() => {
    const atBottom = checkIsAtBottom()
    isAtBottomRef.current = atBottom

    if (atBottom) {
      setShowScrollButton(false)
      setNewMessageCount(0)
    } else {
      setShowScrollButton(true)
    }
  }, [checkIsAtBottom])

  /**
   * Click nút scroll xuống cuối:
   * - Cuộn mượt xuống bottom
   * - Reset trạng thái button và badge
   */
  const handleScrollButtonClick = useCallback(() => {
    scrollToBottom("smooth")
    setShowScrollButton(false)
    setNewMessageCount(0)
  }, [scrollToBottom])

  // ─── Effects ─────────────────────────────────────────────────────────────────

  /**
   * Scroll xuống cuối mỗi khi popup được mở lại.
   * Dùng ref flag thay vì scroll mỗi lần isOpen thay đổi
   * để tránh scroll nhảy khi popup đang mở mà messages update.
   */
  useEffect(() => {
    if (!isOpen) {
      // Popup đóng → đánh dấu lần mở kế tiếp cần scroll
      shouldScrollOnOpenRef.current = true
      return
    }

    if (!shouldScrollOnOpenRef.current) return

    scrollToBottom("smooth")
    shouldScrollOnOpenRef.current = false
  }, [isOpen, scrollToBottom])

  /**
   * Xử lý khi có tin nhắn mới:
   * - Chỉ đếm tin NHẬN ĐẾN (senderId !== userId) và không phải SYSTEM
   * - Nếu người dùng đang không ở cuối → hiển thị badge + nút scroll
   * - Dùng setTimeout(0) để đọc isAtBottomRef sau khi DOM cập nhật xong,
   *   tránh race condition khi state và ref chưa đồng bộ
   */
  useEffect(() => {
    const newCount = messages.length - prevMessageCountRef.current
    prevMessageCountRef.current = messages.length

    if (newCount <= 0 || !isOpen) return

    // Lấy đúng các tin vừa được append vào cuối mảng
    const newMessages = messages.slice(messages.length - newCount)

    // Chỉ tính tin nhắn đến từ phía đối phương, bỏ qua tin hệ thống
    const incomingCount = newMessages.filter(
      (msg) =>
        msg.senderId !== room?.userId &&
        msg.messageType !== "SYSTEM"
    ).length

    if (incomingCount <= 0) return

    setTimeout(() => {
      if (!isAtBottomRef.current) {
        setShowScrollButton(true)
        setNewMessageCount((prev) => prev + incomingCount)
      }
    }, 0)
  }, [messages, isOpen, room?.userId])


  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Vùng scroll chứa danh sách tin nhắn */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full space-y-3 overflow-y-auto bg-slate-50 px-4 py-4"
      >
        {messages.length === 0 ? (
          // Tin chào mặc định khi chưa có cuộc trò chuyện nào
          <div className="max-w-[82%] rounded-[14px] rounded-tl-sm bg-white px-3 py-2 text-sm leading-6 text-slate-700 shadow-sm">
            {DEFAULT_MESSAGE}
          </div>
        ) : (
          messages.map((message) => {
            // Tin nhắn hệ thống hiển thị giữa màn hình (vd: "Cuộc trò chuyện đã bắt đầu")
            if (message.messageType === "SYSTEM") {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-600">
                    {message.content}
                  </div>
                </div>
              )
            }

            const isUserMessage = message.senderId === room?.userId

            return (
              <div
                key={message.id}
                className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[82%] flex-col ${isUserMessage ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-[14px] px-3 py-2 text-sm leading-6 shadow-sm ${isUserMessage
                        ? "rounded-tr-sm bg-blue-500 text-white"
                        : "rounded-tl-sm bg-white text-slate-700"
                      }`}
                  >
                    {message.content}
                  </div>
                  <span className="mt-1 px-1 text-[11px] leading-4 text-slate-400">
                    {getReadStatusLabel(message)}
                  </span>
                </div>
              </div>
            )
          })
        )}

        {/* Anchor element — scrollIntoView sẽ nhắm vào đây */}
        <div ref={bottomRef} />
      </div>

      {/* Nút scroll xuống cuối — chỉ hiện khi người dùng cuộn lên trên */}
      {showScrollButton && (
        <button
          onClick={handleScrollButtonClick}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-95"
        >
          {/* Badge đếm số tin chưa đọc — chỉ hiện khi có tin mới */}
          {newMessageCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] text-white">
              {newMessageCount > 99 ? "99+" : newMessageCount}
            </span>
          )}

          {/* Icon mũi tên xuống */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          Tin nhắn mới
        </button>
      )}
    </div>
  )
}
