import { notFound, redirect, unstable_rethrow } from "next/navigation"

import ChatConversation from "@/components/chat/ChatConversation"
import Container from "@/components/shared/Container"
import { getServerFetchErrorMessage } from "@/lib/error"
import { buildInternalPathWithSearchParams } from "@/lib/navigation"
import { readSearchParam, type RouteSearchParams } from "@/lib/search-params"
import { AUTH_REFRESHED_SEARCH_PARAM, stripAuthRefreshMarker } from "@/server/auth-refresh-redirect"
import { serverPrivateFetch, serverPublicFetch } from "@/server/backend-fetch"
import type { ChatRoom } from "@/types/chat/chat"
import type { ProductDetail } from "@/types/product/productDeteilType"

type ChatProductPageProps = {
  params: Promise<{ roomId: string }>
  searchParams: Promise<RouteSearchParams>
}

async function getChatRoom(roomId: number, refreshRedirectPath: string) {
  try {
    // Endpoint rooms là private nên serverPrivateFetch tự xử lý auth/refresh token.
    const response = await serverPrivateFetch<ChatRoom[]>("/chat/rooms", {
      refreshRedirectPath,
    })

    // Backend hiện chưa có endpoint lấy room theo roomId, nên lọc từ danh sách room của user.
    const room = response.data?.find((chatRoom) => chatRoom.id === roomId) ?? null

    return {
      errorMessage: room ? null : "Khong tim thay cuoc tro chuyen.",
      room,
    }
  } catch (error) {
    // Giữ redirect() của Next khi serverPrivateFetch cần chuyển qua route refresh token.
    unstable_rethrow(error)

    return {
      errorMessage: getServerFetchErrorMessage(error, "Khong the tai cuoc tro chuyen."),
      room: null,
    }
  }
}

async function getChatProduct(productId: number) {
  // Product là dữ liệu public; nếu lỗi thì conversation vẫn render được bằng thông tin trong room.
  return serverPublicFetch<ProductDetail>(`/products/${productId}`).then(
    (response) => response.data ?? null,
    () => null
  )
}

export default async function ChatProductPage({ params, searchParams }: ChatProductPageProps) {
  // Đọc song song dynamic params và query để dựng URL refresh đúng route /chat/[roomId].
  const [{ roomId }, query] = await Promise.all([params, searchParams])
  const parsedRoomId = Number(roomId)

  // roomId không hợp lệ thì trả 404 thật, tránh gọi API với id sai.
  if (!Number.isFinite(parsedRoomId) || parsedRoomId <= 0) {
    notFound()
  }

  // Đường dẫn để route refresh auth quay lại đúng conversation hiện tại.
  const refreshRedirectPath = buildInternalPathWithSearchParams(`/chat/${parsedRoomId}`, query)
  // Marker cho biết request này vừa quay lại sau khi refresh token.
  const hasRefreshMarker = readSearchParam(query[AUTH_REFRESHED_SEARCH_PARAM]) === "1"
  // Lấy room trên server, sau đó truyền xuống ChatConversation làm dữ liệu ban đầu.
  const { errorMessage: roomErrorMessage, room } = await getChatRoom(parsedRoomId, refreshRedirectPath)

  // Refresh auth thành công thì xóa marker khỏi URL.
  if (!roomErrorMessage && hasRefreshMarker) {
    redirect(stripAuthRefreshMarker(refreshRedirectPath))
  }

  if (roomErrorMessage || !room) {
    return (
      <Container className="py-6 sm:py-8 lg:py-10">
        <div className="rounded-[12px] border border-[#f3c9c9] bg-danger-soft px-4 py-3 text-sm font-semibold text-[#b42318]">
          {roomErrorMessage}
        </div>
      </Container>
    )
  }

  // Product detail bổ sung thumbnail/giá/tồn kho cho sidebar conversation.
  const product = await getChatProduct(room.productId)

  // ChatConversation nhận initialRoom/product, sau đó useChatRoom load messages và nghe realtime.
  return <ChatConversation initialRoom={room} product={product} />
}
