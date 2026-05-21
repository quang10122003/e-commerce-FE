"use client"

import { Provider } from "react-redux"
import type { CurrentUserResponse } from "@/types/Auth/CurrentUserResponse"
import Footer from "@/components/footer/Footer"
import { NotificationProvider } from "@/components/ui/NotificationProvider"
import AuthModals from "./AuthModals"
import SessionBootstrap from "./SessionBootstrap"
import { store } from "./store"
import Navbar from "@/components/header/Navbar"
import CartSidebar from "@/components/cart/CartSidebar" // 👈 thêm
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
        <SessionBootstrap hasSessionCookie={hasSessionCookie} initialUser={initialUser} />
         {/* singin singout */}
        <AuthModals />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
        <CartSidebar />
      </NotificationProvider>
      <TailwindIndicator />
    </Provider>
  )
}
