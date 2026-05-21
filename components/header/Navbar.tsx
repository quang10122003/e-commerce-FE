"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Menu, Search, ShoppingCart, X } from "lucide-react"

import { backendApi, useGetCartQuery, useLazyGetCartQuery, useLogoutMutation } from "@/client/api/backend-api"
import { closeLogin, openLogin } from "@/client/session/loginModalSlice"
import { clearPendingRedirectUrls, pushPendingRedirectUrl } from "@/client/session/redirect-stack"
import { clearAuthenticatedUser } from "@/client/session/sessionSlice"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import Container from "@/components/shared/Container"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/ui/main-button"
import { closeCartSidebar, openCartSidebar } from "@/features/cart/cartSidebarSlice"
import { cn } from "@/lib/cn"
import { getCurrentBrowserRoute } from "@/lib/navigation"
import { useNotification } from "../ui/NotificationProvider"

type NavItem = {
  href: string
  matchPath: string
  label: string
}

type UserMenuItem = {
  action: "profile" | "settings" | "logout"
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: "/products", matchPath: "/products", label: "Sản phẩm" },
  { href: "/order", matchPath: "/order", label: "Đơn hàng" },
  { href: "/chat", matchPath: "/chat", label: "Chat" },
]

const USER_MENU_ITEMS: UserMenuItem[] = [
  { action: "profile", label: "Thông tin tài khoản" },
  { action: "settings", label: "Cài đặt" },
  { action: "logout", label: "Đăng xuất" },
]

const APP_URL = process.env.NEXT_PUBLIC_APP_URL

function getUserDisplayInfo(fullName?: string, email?: string) {
  const fallbackCharacter = fullName?.trim().charAt(0) || email?.trim().charAt(0) || "U"
  return {
    avatar: fallbackCharacter.toUpperCase(),
    email: email ?? "",
    fullName: fullName ?? "User",
  }
}

export default function Navbar() {
  const { showNotification } = useNotification()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const hiddenSearchRoutes: string[] = ["/", "/products/"]

  const showSearch = !hiddenSearchRoutes.some((route) => {
    if (route.endsWith("/") && route.length > 1) {
      return pathname.startsWith(route)
    }

    return pathname === route
  })

  const { isAuthenticated, isCheckingAuth, currentUser } = useAppSelector((state) => state.auth)
  const isCartSidebarOpen = useAppSelector((state) => state.cartSidebar.isOpen)
  const [logout] = useLogoutMutation()
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  })
  const cartTotalQuantity = cartData?.data?.totalQuantity ?? 0

  const [requestCart, { isFetching: isCartSidebarLoading }] = useLazyGetCartQuery()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopUserMenuOpen, setIsDesktopUserMenuOpen] = useState(false)
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const userDisplay = getUserDisplayInfo(currentUser?.fullName, currentUser?.email)

  const closeAllMenus = useCallback(() => {
    setIsDesktopUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    setIsMobileUserMenuOpen(false)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsDesktopUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isCartSidebarOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dispatch(closeCartSidebar())
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isCartSidebarOpen, dispatch])

  async function handleLogout() {
    try {
      await logout().unwrap()
    } catch {
      // Logout still clears local UI if the session cookie was already gone.
    } finally {
      clearAuthenticatedUser(dispatch)
      clearPendingRedirectUrls()
      dispatch(closeLogin())
      closeAllMenus()
      dispatch(closeCartSidebar())
      dispatch(backendApi.util.resetApiState())

      if (typeof window !== "undefined") {
        window.location.assign(new URL("/", APP_URL ?? window.location.origin).toString())
      } else {
        router.replace("/")
      }
    }
    showNotification("Đăng xuất thành công", { variant: "success" })
  }

  function handleUserMenuAction(action: UserMenuItem["action"]) {
    if (action === "logout") {
      handleLogout()
      return
    }

    setIsDesktopUserMenuOpen(false)
    setIsMobileUserMenuOpen(false)
  }

  function handleOpenLogin() {
    pushPendingRedirectUrl(getCurrentBrowserRoute(pathname))
    dispatch(openLogin())
  }

  async function handleToggleCartSidebar() {
    if (isCartSidebarOpen) {
      dispatch(closeCartSidebar())
      return
    }

    if (!isAuthenticated) {
      handleOpenLogin()
      return
    }

    if (typeof window !== "undefined" && window.innerWidth <= 750) {
      router.push("/cart")
      return
    }

    closeAllMenus()

    try {
      await requestCart().unwrap()
      dispatch(openCartSidebar())
    } catch {
      dispatch(closeCartSidebar())
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95">
      <Container className="relative py-4">
        <div className="surface-primary flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
          <Link className="min-w-0 shrink-0" href="/">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-[12px] bg-primary text-base font-bold text-white">
                M
              </span>
              <div className="min-w-0">
                <p className="text-base font-bold tracking-tight text-slate-950 sm:text-lg">
                  MyShop
                </p>
                <p className="text-xs font-medium text-slate-500">Mua sắm tinh gọn mỗi ngày</p>
              </div>
            </div>
          </Link>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <ul className="flex items-center gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <Link
                    aria-current={pathname === item.matchPath ? "page" : undefined}
                    className={cn(
                      "inline-flex rounded-[12px] px-4 py-2 text-sm font-medium text-slate-600 hover:bg-primary-soft hover:text-primary",
                      pathname === item.matchPath && "bg-primary-soft text-primary"
                    )}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="order-3 flex w-full items-center gap-3 sm:order-0 sm:flex-1 lg:w-auto lg:max-w-xl">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className={cn(
                  "pl-11",
                  !showSearch && "pointer-events-none bg-slate-100 text-slate-400 opacity-70"
                )}
                placeholder="Tìm kiếm sản phẩm..."
                type="text"
              />
            </div>

            <button
              aria-busy={isCartSidebarLoading}
              aria-controls="cart-preview-dialog"
              aria-expanded={isCartSidebarOpen}
              aria-haspopup="dialog"
              className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-border bg-white text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
              disabled={isCartSidebarLoading}
              onClick={handleToggleCartSidebar}
              type="button"
            >
              {cartTotalQuantity > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white">
                  {cartTotalQuantity}
                </span>
              ) : null}
              <ShoppingCart className="size-5" />
            </button>

            {!isCheckingAuth && isAuthenticated ? (
              <div className="relative hidden lg:block" ref={userMenuRef}>
                <button
                  className="inline-flex min-w-0 items-center gap-3 rounded-[12px] border border-border bg-white px-3 py-2 text-left hover:bg-primary-soft"
                  onClick={() => setIsDesktopUserMenuOpen((prev) => !prev)}
                  type="button"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {userDisplay.avatar}
                  </span>
                  <span className="grid min-w-0">
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {userDisplay.fullName}
                    </span>
                    <span className="truncate text-xs text-slate-500">{userDisplay.email}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-slate-400 transition-transform",
                      isDesktopUserMenuOpen && "rotate-180 text-primary"
                    )}
                  />
                </button>

                {isDesktopUserMenuOpen ? (
                  <div className="surface-overlay absolute right-0 top-[calc(100%+0.75rem)] w-72 p-3">
                    <div className="surface-secondary flex items-center gap-3 p-4">
                      <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
                        {userDisplay.avatar}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {userDisplay.fullName}
                        </p>
                        <p className="truncate text-sm text-slate-500">{userDisplay.email}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-1">
                      {USER_MENU_ITEMS.map((item) => (
                        <button
                          key={item.action}
                          className="rounded-[12px] px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
                          onClick={() => handleUserMenuAction(item.action)}
                          type="button"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <MainButton
                className="hidden lg:inline-flex"
                onClick={handleOpenLogin}
                type="button"
                variant="secondary"
              >
                Đăng nhập
              </MainButton>
            )}

            <button
              aria-expanded={isMobileMenuOpen}
              aria-label="Mở menu"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-border bg-white text-slate-700 lg:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              type="button"
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "surface-overlay absolute right-4 top-[calc(100%+0.75rem)] z-20 w-[min(84vw,340px)] p-3 lg:hidden",
            isMobileMenuOpen
              ? "pointer-events-auto visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
            "transition-all duration-200"
          )}
        >
          <ul className="grid gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={`mobile-${item.label}`}>
                <Link
                  aria-current={pathname === item.matchPath ? "page" : undefined}
                  className={cn(
                    "block rounded-[12px] px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary",
                    pathname === item.matchPath && "bg-primary-soft text-primary"
                  )}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="mt-2 border-t border-border pt-3">
              {!isCheckingAuth && isAuthenticated ? (
                <>
                  <button
                    className="surface-secondary flex w-full items-center gap-3 p-4 text-left"
                    onClick={() => setIsMobileUserMenuOpen((prev) => !prev)}
                    type="button"
                  >
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {userDisplay.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {userDisplay.fullName}
                      </p>
                      <p className="truncate text-xs text-slate-500">{userDisplay.email}</p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-4 text-slate-400 transition-transform",
                        isMobileUserMenuOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>

                  {isMobileUserMenuOpen ? (
                    <div className="mt-2 grid gap-1">
                      {USER_MENU_ITEMS.map((item) => (
                        <button
                          key={item.action}
                          className="rounded-[12px] px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
                          onClick={() => handleUserMenuAction(item.action)}
                          type="button"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <MainButton
                  fullWidth
                  onClick={() => {
                    handleOpenLogin()
                    setIsMobileMenuOpen(false)
                  }}
                  type="button"
                  variant="secondary"
                >
                  Đăng nhập
                </MainButton>
              )}
            </li>
          </ul>
        </div>
      </Container>
    </nav>
  )
}
