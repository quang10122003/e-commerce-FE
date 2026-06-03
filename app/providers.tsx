"use client"

import { Provider } from "react-redux"
import type { CurrentUserResponse } from "@/types/Auth/CurrentUserResponse"
import { NotificationProvider } from "@/components/ui/NotificationProvider"
import AuthModals from "./AuthModals"
import SessionBootstrap from "./SessionBootstrap"
import { store } from "./store"
import CartSidebar from "@/components/cart/CartSidebar"
import { TailwindIndicator } from "@/components/TailwindIndicatort"

type ProvidersProps = {
  children: React.ReactNode
  hasSessionCookie: boolean
  initialUser: CurrentUserResponse | null
}

export default function Providers({ children, hasSessionCookie, initialUser }: ProvidersProps) {
  return (
    <Provider store={store}>
      <NotificationProvider>
        {/* Khởi tạo session từ cookie khi app load */}
        <SessionBootstrap hasSessionCookie={hasSessionCookie} initialUser={initialUser} />
        {/* Global UI — cần mount toàn app, kể cả route (standalone) */}
        <AuthModals />
        <CartSidebar />
        {children}
      </NotificationProvider>
      <TailwindIndicator />
    </Provider>
  )
}
