"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  faBars,
  faCartShopping,
  faChevronDown,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import CartSidebar from "@/components/cart/CartSidebar"
import { clearAuthenticatedUser } from "@/features/auth/authSlice"
import { openLogin } from "@/features/auth/loginSlice"
import { useLazyGetCartQuery } from "@/features/auth/tokenApi"
import styles from "@/styles/Navbar.module.css"

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
  { href: "/oder", matchPath: "/oder", label: "Đơn hàng" },
  { href: "/chat", matchPath: "/chat", label: "Chat" },
]

const USER_MENU_ITEMS: UserMenuItem[] = [
  { action: "profile", label: "Thông tin user" },
  { action: "settings", label: "Cài đặt" },
  { action: "logout", label: "Đăng xuất" },
]

function getUserDisplayInfo(fullName?: string, email?: string) {
  // Navbar luon co mot avatar chu cai, ke ca khi profile chua du du lieu.
  const fallbackCharacter = fullName?.trim().charAt(0) || email?.trim().charAt(0) || "U"

  return {
    avatar: fallbackCharacter.toUpperCase(),
    email: email ?? "",
    fullName: fullName ?? "User",
  }
}

export default function AppNavbar() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isCheckingAuth, currentUser } = useAppSelector((state) => state.auth)
  const [requestCart, { isFetching: isCartSidebarLoading }] = useLazyGetCartQuery()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopUserMenuOpen, setIsDesktopUserMenuOpen] = useState(false)
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false)
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  // userDisplay gom san du lieu view-level de JSX duoi khong phai lap lai fallback logic.
  const userDisplay = getUserDisplayInfo(currentUser?.fullName, currentUser?.email)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsDesktopUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!isCartSidebarOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCartSidebarOpen(false)
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isCartSidebarOpen])

  function closeAllMenus() {
    // Gom logic dong tat ca popup nho ve mot cho de tranh bo sot state khi dieu huong.
    setIsDesktopUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    setIsMobileUserMenuOpen(false)
  }

  function handleCloseCartSidebar() {
    setIsCartSidebarOpen(false)
  }

  function handleLogout() {
    clearAuthenticatedUser(dispatch)
    closeAllMenus()
    handleCloseCartSidebar()
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
      handleCloseCartSidebar()
      return
    }

    if (!isAuthenticated) {
      handleOpenLogin()
      return
    }

    if (typeof window !== "undefined" && window.innerWidth <= 750) {
      // Mobile chuyen sang trang cart day du thay vi mo sidebar de tranh bi chat giao dien.
      router.push("/cart")
      return
    }

    closeAllMenus()

    try {
      // Prefetch cart truoc khi mo sidebar de UI mo ra da co du lieu moi nhat.
      await requestCart().unwrap()
      setIsCartSidebarOpen(true)
    } catch {
      handleCloseCartSidebar()
    }
  }

  return (
    <nav className={styles.navbar}>
      <Link href="/">
        <h1 className={styles.navbar__brand}>My shop</h1>
      </Link>

      <div className={styles.navbar__menu}>
        <ul className={styles.navbar__list}>
          {NAV_ITEMS.map((item) => (
            <li className={styles.navbar__item} key={item.label}>
              <Link
                aria-current={pathname === item.matchPath ? "page" : undefined}
                className={`${styles.navbar__link} ${pathname === item.matchPath ? styles["navbar__link--active"] : ""}`}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.navbar__search}>
        <input className={styles.navbar__searchInput} type="text" />
        <button className={styles.navbar__searchButton} type="button">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>

      {!isCheckingAuth && isAuthenticated ? (
        <div className={styles.navbar__userArea} ref={userMenuRef}>
          <button
            type="button"
            className={styles.navbar__userButton}
            onClick={() => setIsDesktopUserMenuOpen((previousValue) => !previousValue)}
          >
            <span className={styles.navbar__avatar} aria-hidden="true">
              {userDisplay.avatar}
            </span>
            <span className={styles.navbar__userMeta}>
              <span className={styles.navbar__userName}>{userDisplay.fullName}</span>
              <span className={styles.navbar__userEmail}>{userDisplay.email}</span>
            </span>
            <FontAwesomeIcon
              className={`${styles.navbar__userChevron} ${isDesktopUserMenuOpen ? styles["navbar__userChevron--open"] : ""}`}
              icon={faChevronDown}
            />
          </button>

          {isDesktopUserMenuOpen ? (
            <div className={styles.navbar__userDropdown}>
              <div className={styles.navbar__userDropdownHeader}>
                <span className={styles.navbar__userDropdownAvatar} aria-hidden="true">
                  {userDisplay.avatar}
                </span>
                <div className={styles.navbar__userDropdownMeta}>
                  <span className={styles.navbar__userDropdownName}>{userDisplay.fullName}</span>
                  <span className={styles.navbar__userDropdownEmail}>{userDisplay.email}</span>
                </div>
              </div>

              <div className={styles.navbar__userDropdownList}>
                {USER_MENU_ITEMS.map((item) => (
                  <button
                    key={item.action}
                    type="button"
                    className={styles.navbar__userDropdownItem}
                    onClick={() => handleUserMenuAction(item.action)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <button className={styles.navbar__loginButton} type="button" onClick={handleOpenLogin}>
          Đăng nhập
        </button>
      )}

      <button
        aria-controls="cart-preview-dialog"
        aria-expanded={isCartSidebarOpen}
        aria-busy={isCartSidebarLoading}
        aria-haspopup="dialog"
        className={styles.navbar__cartButton}
        disabled={isCartSidebarLoading}
        onClick={handleToggleCartSidebar}
        type="button"
      >
        <p className={styles["navbar__cartButton-p"]}>1</p>
        <FontAwesomeIcon className={styles.navbar__cartIcon} icon={faCartShopping} />
      </button>

      <button
        aria-expanded={isMobileMenuOpen}
        aria-label="Mở menu"
        className={styles.navbar__toggle}
        onClick={() => setIsMobileMenuOpen((previousValue) => !previousValue)}
        type="button"
      >
        <FontAwesomeIcon icon={isMobileMenuOpen ? faXmark : faBars} />
      </button>

      <div className={`${styles.navbar__mobileMenu} ${isMobileMenuOpen ? styles["navbar__mobileMenu--open"] : ""}`}>
        <ul className={styles.navbar__mobileList}>
          {NAV_ITEMS.map((item) => (
            <li className={styles.navbar__mobileItem} key={`mobile-${item.label}`}>
              <Link
                aria-current={pathname === item.matchPath ? "page" : undefined}
                className={`${styles.navbar__mobileLink} ${pathname === item.matchPath ? styles["navbar__mobileLink--active"] : ""}`}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}

          <li className={styles.navbar__mobileItem}>
            {!isCheckingAuth && isAuthenticated ? (
              <>
                <button
                  type="button"
                  className={styles.navbar__mobileProfile}
                  onClick={() => setIsMobileUserMenuOpen((previousValue) => !previousValue)}
                >
                  <span className={styles.navbar__mobileAvatar} aria-hidden="true">
                    {userDisplay.avatar}
                  </span>
                  <div className={styles.navbar__mobileUserMeta}>
                    <span className={styles.navbar__mobileUserName}>{userDisplay.fullName}</span>
                    <span className={styles.navbar__mobileUserEmail}>{userDisplay.email}</span>
                  </div>
                  <FontAwesomeIcon
                    className={`${styles.navbar__mobileUserChevron} ${isMobileUserMenuOpen ? styles["navbar__mobileUserChevron--open"] : ""}`}
                    icon={faChevronDown}
                  />
                </button>

                {isMobileUserMenuOpen ? (
                  <div className={styles.navbar__mobileUserList}>
                    {USER_MENU_ITEMS.map((item) => (
                      <button
                        key={item.action}
                        type="button"
                        className={styles.navbar__mobileUserItem}
                        onClick={() => handleUserMenuAction(item.action)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <button
                className={styles.navbar__mobileLoginButton}
                onClick={() => {
                  handleOpenLogin()
                  setIsMobileMenuOpen(false)
                }}
                type="button"
              >
                Đăng nhập
              </button>
            )}
          </li>
        </ul>
      </div>

      <CartSidebar isOpen={isCartSidebarOpen} onClose={handleCloseCartSidebar} />
    </nav>
  )
}
