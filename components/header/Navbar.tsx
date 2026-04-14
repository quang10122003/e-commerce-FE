"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Menu, Search, ShoppingCart, X } from "lucide-react"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import Container from "@/components/shared/Container"
import { Input } from "@/components/ui/input"
import MainButton from "@/components/ui/main-button"
import { clearAuthenticatedUser } from "@/features/auth/authSlice"
import { openLogin } from "@/features/auth/loginSlice"
import { useLazyGetCartQuery } from "@/features/auth/tokenApi"
import { openCartSidebar, closeCartSidebar } from "@/features/cart/cartSidebarSlice" // 👈
import { cn } from "@/lib/utils"

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
  { href: "/products", matchPath: "/products", label: "San pham" },
  { href: "/oder", matchPath: "/oder", label: "Don hang" },
  { href: "/chat", matchPath: "/chat", label: "Chat" },
]

const USER_MENU_ITEMS: UserMenuItem[] = [
  { action: "profile", label: "Thong tin user" },
  { action: "settings", label: "Cai dat" },
  { action: "logout", label: "Dang xuat" },
]

function getUserDisplayInfo(fullName?: string, email?: string) {
  const fallbackCharacter = fullName?.trim().charAt(0) || email?.trim().charAt(0) || "U"
  return {
    avatar: fallbackCharacter.toUpperCase(),
    email: email ?? "",
    fullName: fullName ?? "User",
  }
}

export default function Navbar() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isCheckingAuth, currentUser } = useAppSelector((state) => state.auth)

  // 👇 Lấy isOpen từ Redux thay vì local state
  const isCartSidebarOpen = useAppSelector((state) => state.cartSidebar.isOpen)

  const [requestCart, { isFetching: isCartSidebarLoading }] = useLazyGetCartQuery()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopUserMenuOpen, setIsDesktopUserMenuOpen] = useState(false)
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const userDisplay = getUserDisplayInfo(currentUser?.fullName, currentUser?.email)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsDesktopUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Khoa scroll + dong sidebar khi nhan Escape
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

  function closeAllMenus() {
    setIsDesktopUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    setIsMobileUserMenuOpen(false)
  }

  function handleLogout() {
    clearAuthenticatedUser(dispatch)
    closeAllMenus()
    dispatch(closeCartSidebar())
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
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-background/90 backdrop-blur-xl">
      <Container className="relative flex items-center gap-3 py-3 max-[750px]:gap-2 max-[750px]:py-2">

        {/* Logo */}
        <Link className="shrink-0" href="/">
          <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            My shop
          </h1>
        </Link>

        {/* Nav desktop */}
        <div className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  aria-current={pathname === item.matchPath ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium text-slate-600 transition hover:text-slate-950",
                    pathname === item.matchPath && "font-semibold text-sky-700"
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Nhom phai: search + user + gio hang + hamburger */}
        <div className="flex flex-1 items-center justify-end gap-3 min-[751px]:min-w-55">

          {/* Thanh tim kiem */}
          <div className="relative flex-1 max-w-xl max-[750px]:max-w-none">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-11 rounded-full border-slate-200 bg-slate-50 pl-11 pr-4 max-[750px]:h-10"
              placeholder="Tim kiem san pham..."
              type="text"
            />
          </div>

          {/* User menu desktop */}
          {!isCheckingAuth && isAuthenticated ? (
            <div className="relative hidden min-[751px]:block" ref={userMenuRef}>
              <button
                className="inline-flex min-w-0 items-center gap-3 rounded-full border border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-2 py-1.5 text-left shadow-sm transition hover:border-sky-200"
                onClick={() => setIsDesktopUserMenuOpen((prev) => !prev)}
                type="button"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] text-sm font-bold text-white">
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
                    "size-4 shrink-0 text-slate-500 transition-transform",
                    isDesktopUserMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {isDesktopUserMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-[24px] border border-sky-100 bg-white p-3 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.28)]">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-2 pb-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] text-base font-bold text-white">
                      {userDisplay.avatar}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{userDisplay.fullName}</p>
                      <p className="truncate text-sm text-slate-500">{userDisplay.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 grid gap-1">
                    {USER_MENU_ITEMS.map((item) => (
                      <button
                        key={item.action}
                        className="rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
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
              className="hidden min-[751px]:inline-flex"
              onClick={handleOpenLogin}
              text="Dang nhap"
              type="button"
              variant="secondary"
            />
          )}

          {/* Nut gio hang */}
          <button
            aria-busy={isCartSidebarLoading}
            aria-controls="cart-preview-dialog"
            aria-expanded={isCartSidebarOpen}
            aria-haspopup="dialog"
            className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950 max-[750px]:size-10"
            disabled={isCartSidebarLoading}
            onClick={handleToggleCartSidebar}
            type="button"
          >
            <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-sky-100 px-1.5 text-[11px] font-bold text-sky-700">
              1
            </span>
            <ShoppingCart className="size-5" />
          </button>

          {/* Nut hamburger (chi hien mobile) */}
          <button
            aria-expanded={isMobileMenuOpen}
            aria-label="Mo menu"
            className="hidden size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm max-[750px]:inline-flex"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            type="button"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Menu mobile dropdown */}
        <div
          className={cn(
            "absolute right-4 top-[calc(100%+0.5rem)] hidden w-[min(60vw,320px)] rounded-[24px] border border-slate-200 bg-white p-2 shadow-xl max-[750px]:block",
            isMobileMenuOpen
              ? "pointer-events-auto visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
            "transition-all duration-200"
          )}
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={`mobile-${item.label}`}>
                <Link
                  aria-current={pathname === item.matchPath ? "page" : undefined}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950",
                    pathname === item.matchPath && "bg-sky-50 text-sky-700"
                  )}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            <li className="border-t border-slate-100 pt-2">
              {!isCheckingAuth && isAuthenticated ? (
                <>
                  <button
                    className="flex w-full items-center gap-3 rounded-[20px] border border-sky-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eff6ff_100%)] px-4 py-3 text-left"
                    onClick={() => setIsMobileUserMenuOpen((prev) => !prev)}
                    type="button"
                  >
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] text-sm font-bold text-white">
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
                        "size-4 text-slate-500 transition-transform",
                        isMobileUserMenuOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {isMobileUserMenuOpen ? (
                    <div className="mt-2 grid gap-1">
                      {USER_MENU_ITEMS.map((item) => (
                        <button
                          key={item.action}
                          className="rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
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
                  className="w-full"
                  fullWidth
                  onClick={() => {
                    handleOpenLogin()
                    setIsMobileMenuOpen(false)
                  }}
                  type="button"
                  variant="secondary"
                >
                  Dang nhap
                </MainButton>
              )}
            </li>
          </ul>
        </div>

      </Container>
    </nav>
  )
}