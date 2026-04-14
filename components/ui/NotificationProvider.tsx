"use client"

import * as React from "react"
import { CheckCircle2, CircleAlert, CircleX, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

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

const TOAST_EXIT_DURATION_MS = 520

// Gom style theo variant de logic render toast giu mot component duy nhat.
const variantStyles: Record<
    NotificationVariant,
    {
        accent: string
        glow: string
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
        accent: "border-sky-200/90",
        glow: "bg-sky-300/30",
        panel: "bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(224,242,254,0.95))]",
        iconWrap: "bg-sky-100 ring-1 ring-sky-200/80",
        icon: "text-sky-700",
        label: "bg-sky-100 text-sky-800 ring-1 ring-sky-200/80",
        title: "text-slate-950",
        message: "text-slate-700",
        closeButton: "text-sky-700 hover:bg-sky-100 focus-visible:ring-sky-300",
        defaultTitle: "Thông tin",
        badgeLabel: "Thông tin",
        role: "status",
        ariaLive: "polite",
        Icon: Info,
    },
    success: {
        accent: "border-emerald-200/90",
        glow: "bg-emerald-300/30",
        panel: "bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(209,250,229,0.95))]",
        iconWrap: "bg-emerald-100 ring-1 ring-emerald-200/80",
        icon: "text-emerald-700",
        label: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80",
        title: "text-slate-950",
        message: "text-slate-700",
        closeButton: "text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-300",
        defaultTitle: "Thành công",
        badgeLabel: "Thành công",
        role: "status",
        ariaLive: "polite",
        Icon: CheckCircle2,
    },
    warning: {
        accent: "border-amber-200/90",
        glow: "bg-amber-300/30",
        panel: "bg-[linear-gradient(135deg,rgba(255,251,235,0.98),rgba(254,243,199,0.95))]",
        iconWrap: "bg-amber-100 ring-1 ring-amber-200/80",
        icon: "text-amber-700",
        label: "bg-amber-100 text-amber-800 ring-1 ring-amber-200/80",
        title: "text-slate-950",
        message: "text-slate-700",
        closeButton: "text-amber-700 hover:bg-amber-100 focus-visible:ring-amber-300",
        defaultTitle: "Cảnh báo",
        badgeLabel: "Cảnh báo",
        role: "alert",
        ariaLive: "polite",
        Icon: CircleAlert,
    },
    error: {
        accent: "border-rose-200/90",
        glow: "bg-rose-300/30",
        panel: "bg-[linear-gradient(135deg,rgba(255,241,242,0.99),rgba(255,228,230,0.96))]",
        iconWrap: "bg-rose-100 ring-1 ring-rose-200/80",
        icon: "text-rose-700",
        label: "bg-rose-100 text-rose-800 ring-1 ring-rose-200/80",
        title: "text-slate-950",
        message: "text-slate-700",
        closeButton: "text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-300",
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
    // heading luon co gia tri, hoac do caller truyen vao, hoac do variant quy dinh.
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
        <div className="pointer-events-none fixed inset-x-0 top-4 z-100 overflow-x-hidden flex justify-end px-4 sm:top-6 sm:px-6">
            <div
                className={cn(
                    "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[28px] border shadow-[0_24px_60px_-24px_rgba(15,23,42,0.38)] backdrop-blur-xl transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none",
                    isVisible ? "translate-x-0 opacity-100" : "translate-x-[calc(100%+1.5rem)] opacity-0",
                    style.accent,
                    style.panel
                )}
                role={style.role}
                aria-live={style.ariaLive}
            >
                <div className="absolute left-0 top-0 h-full w-1.5 bg-black/5" />
                <div className={cn("absolute -right-10 top-0 h-28 w-28 rounded-full blur-3xl", style.glow)} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.2))]" />

                <div className="relative flex items-start gap-3 p-4 sm:p-5">
                    <div className={cn("mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", style.iconWrap)}>
                        <Icon className={cn("h-5 w-5", style.icon)} aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", style.label)}>
                                {style.badgeLabel}
                            </span>
                            <p className={cn("text-base font-semibold tracking-[0.01em]", style.title)}>{heading}</p>
                        </div>
                        <p className={cn("text-sm font-medium leading-6 sm:text-[15px]", style.message)}>{message}</p>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Đóng thông báo"
                        className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80",
                            style.closeButton
                        )}
                        type="button"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
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
    // closeTimerRef giu timer hien tai de lan show tiep theo co the huy timer cu.
    const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    const showNotification = React.useCallback(
        (
            message: string,
            { title, variant = "info", duration = 3500 }: { title?: string; variant?: NotificationVariant; duration?: number } = {}
        ) => {
            // Moi lan show moi deu reset timer cu de thong bao moi khong bi dong som.
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
            // Giu notification trong mot khoang ngan de animation out ket thuc truoc khi unmount.
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
