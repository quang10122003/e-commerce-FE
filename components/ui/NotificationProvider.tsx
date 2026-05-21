"use client"

import * as React from "react"
import { CheckCircle2, CircleAlert, CircleX, Info, X } from "lucide-react"
import { cn } from "@/lib/cn"

type NotificationVariant = "info" | "success" | "warning" | "error"

interface NotificationData {
  title?: string
  message: string
  variant: NotificationVariant
  duration: number
}

interface NotificationBannerProps {
  title?: string
  message: string
  variant: NotificationVariant
  open: boolean
  onClose: () => void
}

const TOAST_EXIT_DURATION_MS = 320

const variantStyles: Record<
  NotificationVariant,
  {
    panel: string
    iconWrap: string
    icon: string
    label: string
    title: string
    message: string
    closeButton: string
    defaultTitle: string
    badgeLabel: string
    role: "status" | "alert"
    ariaLive: "polite" | "assertive"
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  }
> = {
  info: {
    panel: "border-[#cddcf7] bg-white",
    iconWrap: "bg-primary-soft",
    icon: "text-primary",
    label: "bg-primary-soft text-primary",
    title: "text-slate-950",
    message: "text-slate-600",
    closeButton: "text-slate-500 hover:bg-primary-soft hover:text-primary",
    defaultTitle: "Thông tin",
    badgeLabel: "Thông tin",
    role: "status",
    ariaLive: "polite",
    Icon: Info,
  },
  success: {
    panel: "border-[#cfead7] bg-white",
    iconWrap: "bg-success-soft",
    icon: "text-[#166534]",
    label: "bg-success-soft text-[#166534]",
    title: "text-slate-950",
    message: "text-slate-600",
    closeButton: "text-slate-500 hover:bg-success-soft hover:text-[#166534]",
    defaultTitle: "Thành công",
    badgeLabel: "Thành công",
    role: "status",
    ariaLive: "polite",
    Icon: CheckCircle2,
  },
  warning: {
    panel: "border-[#f1dfb0] bg-white",
    iconWrap: "bg-warning-soft",
    icon: "text-[#9a6700]",
    label: "bg-warning-soft text-[#9a6700]",
    title: "text-slate-950",
    message: "text-slate-600",
    closeButton: "text-slate-500 hover:bg-warning-soft hover:text-[#9a6700]",
    defaultTitle: "Cảnh báo",
    badgeLabel: "Cảnh báo",
    role: "alert",
    ariaLive: "polite",
    Icon: CircleAlert,
  },
  error: {
    panel: "border-[#efc4c4] bg-white",
    iconWrap: "bg-danger-soft",
    icon: "text-[#b42318]",
    label: "bg-danger-soft text-[#b42318]",
    title: "text-slate-950",
    message: "text-slate-600",
    closeButton: "text-slate-500 hover:bg-danger-soft hover:text-[#b42318]",
    defaultTitle: "Lỗi",
    badgeLabel: "Lỗi",
    role: "alert",
    ariaLive: "assertive",
    Icon: CircleX,
  },
}

function NotificationBanner({ open, title, message, variant, onClose }: NotificationBannerProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const style = variantStyles[variant]
  const heading = title ?? style.defaultTitle
  const Icon = style.Icon

  React.useEffect(() => {
    if (open) {
      const frameId = window.requestAnimationFrame(() => {
        setIsVisible(true)
      })

      return () => window.cancelAnimationFrame(frameId)
    }

    setIsVisible(false)
    return undefined
  }, [open])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-100 flex justify-end px-4 sm:top-6 sm:px-6">
      <div
        className={cn(
          "pointer-events-auto w-full max-w-sm rounded-[12px] border p-4 shadow-[var(--shadow-overlay)] transition-[transform,opacity] duration-300",
          isVisible ? "translate-x-0 opacity-100" : "translate-x-[calc(100%+1rem)] opacity-0",
          style.panel
        )}
        role={style.role}
        aria-live={style.ariaLive}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-[12px]",
              style.iconWrap
            )}
          >
            <Icon className={cn("size-5", style.icon)} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  style.label
                )}
              >
                {style.badgeLabel}
              </span>
              <p className={cn("text-sm font-semibold", style.title)}>{heading}</p>
            </div>
            <p className={cn("text-sm leading-6", style.message)}>{message}</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng thông báo"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[10px] transition-colors",
              style.closeButton
            )}
            type="button"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

interface NotificationContextValue {
  showNotification: (
    message: string,
    options?: {
      title?: string
      variant?: NotificationVariant
      duration?: number
    }
  ) => void
  hideNotification: () => void
}

const NotificationContext = React.createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = React.useState<NotificationData | null>(null)
  const [open, setOpen] = React.useState(false)
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const showNotification = React.useCallback(
    (
      message: string,
      {
        title,
        variant = "info",
        duration = 3500,
      }: { title?: string; variant?: NotificationVariant; duration?: number } = {}
    ) => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }

      setNotification({ title, message, variant, duration })
      setOpen(true)

      closeTimerRef.current = setTimeout(() => {
        setOpen(false)
      }, duration)
    },
    []
  )

  const hideNotification = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }

    setOpen(false)
  }, [])

  React.useEffect(() => {
    if (!open) {
      const timeoutId = setTimeout(() => setNotification(null), TOAST_EXIT_DURATION_MS)
      return () => clearTimeout(timeoutId)
    }

    return undefined
  }, [open])

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notification ? (
        <NotificationBanner
          open={open}
          title={notification.title}
          message={notification.message}
          variant={notification.variant}
          onClose={hideNotification}
        />
      ) : null}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = React.useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider")
  }

  return context
}
