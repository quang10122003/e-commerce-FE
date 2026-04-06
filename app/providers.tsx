"use client"
import { Provider } from "react-redux"
import AppNavbar from "@/components/AppNavbar"
import { NotificationProvider } from "@/components/ui/NotificationProvider"
import AuthModals from "./AuthModals"
import SessionBootstrap from "./SessionBootstrap"
import { store } from "./store"

type ProvidersProps = {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <SessionBootstrap />
        <AuthModals />
        <AppNavbar />
        {children}
      </NotificationProvider>
    </Provider>
  )
}
