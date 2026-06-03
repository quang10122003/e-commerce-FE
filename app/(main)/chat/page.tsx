import { redirect, unstable_rethrow } from "next/navigation"

import ChatRoomList from "@/components/chat/ChatRoomList"
import { getServerFetchErrorMessage } from "@/lib/error"
import { buildInternalPathWithSearchParams } from "@/lib/navigation"
import { readSearchParam, type RouteSearchParams } from "@/lib/search-params"
import { AUTH_REFRESHED_SEARCH_PARAM, stripAuthRefreshMarker } from "@/server/auth-refresh-redirect"
import { serverPrivateFetch } from "@/server/backend-fetch"
import type { ChatRoom } from "@/types/chat/chat"

type ChatPageProps = {
  searchParams: Promise<RouteSearchParams>
}

async function getChatInitialData(refreshRedirectPath: string) {
  try {
    // Server page lấy danh sách room đầu tiên để HTML có dữ liệu ngay khi render.
    const response = await serverPrivateFetch<ChatRoom[]>("/chat/rooms", {
      refreshRedirectPath,
    })

    return {
      errorMessage: response.data ? null : "Khong the tai danh sach chat.",
      rooms: response.data ?? [],
    }
  } catch (error) {
    // Giữ redirect() của Next khi serverPrivateFetch cần chuyển qua route refresh token.
    unstable_rethrow(error)

    return {
      errorMessage: getServerFetchErrorMessage(error, "Khong the tai danh sach chat."),
      rooms: [],
    }
  }
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  // Next 16 truyền searchParams dạng Promise trong Server Component.
  const params = await searchParams

  // Ghi nhớ đúng URL hiện tại để sau khi refresh token có thể quay lại /chat kèm query cũ.
  const refreshRedirectPath = buildInternalPathWithSearchParams("/chat", params)

  // Marker này cho biết request hiện tại vừa quay về từ route refresh auth.
  const hasRefreshMarker = readSearchParam(params[AUTH_REFRESHED_SEARCH_PARAM]) === "1"

  // Dữ liệu đi từ Server Component xuống Client Component, sau đó useChatInbox tiếp quản realtime.
  const { errorMessage, rooms } = await getChatInitialData(refreshRedirectPath)

  // Nếu refresh token đã xong và dữ liệu tải ổn, xóa marker khỏi URL để URL sạch lại.
  if (!errorMessage && hasRefreshMarker) {
    redirect(stripAuthRefreshMarker(refreshRedirectPath))
  }

  // ChatRoomList render dữ liệu ban đầu, rồi hook useChatInbox cập nhật preview/unread qua socket.
  return <ChatRoomList errorMessage={errorMessage} rooms={rooms} />
}
