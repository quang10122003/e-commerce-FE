"use client"

import { Provider } from "react-redux"
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
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <SessionBootstrap />
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
