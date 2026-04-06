"use client"

import { useEffect } from "react"
import Link from "next/link"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAppSelector } from "@/app/hooks"
import { useGetCartQuery } from "@/features/auth/tokenApi"
import styles from "@/styles/CartSidebar.module.css"

export type CartSidebarItem = {
  id: string
  name: string
  quantity: number
  unitPrice: number
  thumbnail?: string
}

type CartSidebarProps = {
  items?: CartSidebarItem[]
  isOpen?: boolean
  onClose?: () => void
}

const MAX_VISIBLE_ITEMS = 3

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

// Dung ten san pham de tao fallback thumbnail khi API chua tra ve anh.

// Dùng tên sản phẩm để tạo fallback thumbnail khi API chưa trả về ảnh.
function getProductInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export default function CartSidebar({
  items,
  isOpen = false,
  onClose,
}: CartSidebarProps) {
  const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth)
  // Khi co items tu props, component se hien thi du lieu caller truyen vao thay vi goi API cart/me.
  const hasCustomItems = Array.isArray(items)

  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      onClose?.()
    }
  }, [isAuthenticated, isOpen, onClose])

  const {
    data: cartResponse,
    error,
    isFetching,
    isLoading,
  } = useGetCartQuery(undefined, {
    refetchOnMountOrArgChange: true,
    // Chi tai gio hang khi sidebar dang mo va auth state da on dinh.
    skip: hasCustomItems || !isOpen || !isAuthenticated || isCheckingAuth,
  })

  const fetchedItems = (cartResponse?.data?.items ?? []).map((item) => ({
    id: String(item.productId),
    name: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    thumbnail: item.thumbnail,
  }))
  // Gom du lieu tu props va du lieu API ve mot shape chung de JSX ben duoi khong phai tach 2 nhanh.
  const resolvedItems = hasCustomItems ? items : fetchedItems
  const visibleItems = resolvedItems.slice(0, MAX_VISIBLE_ITEMS)
  const hiddenItemsCount = Math.max(resolvedItems.length - visibleItems.length, 0)
  const totalQuantity = hasCustomItems
    ? resolvedItems.reduce((total, item) => total + item.quantity, 0)
    : (cartResponse?.data?.totalQuantity ?? 0)
  const cartTotal = hasCustomItems
    ? resolvedItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    : (cartResponse?.data?.totalAmount ?? 0)
  const showLoadingState = !hasCustomItems && isOpen && isAuthenticated && (isLoading || isFetching)
  const showErrorState = !showLoadingState && Boolean(error)
  const showEmptyState = !showLoadingState && !showErrorState && resolvedItems.length === 0

  return (
    <div
      aria-hidden={!isOpen}
      className={`${styles.preview} ${isOpen ? styles.previewOpen : styles.previewClosed}`}
    >
      <button
        aria-label="Đóng xem trước giỏ hàng"
        className={styles.backdrop}
        onClick={onClose}
        type="button"
      />

      <div
        aria-labelledby="cart-preview-title"
        aria-modal="true"
        className={styles.panel}
        id="cart-preview-dialog"
        role="dialog"
      >
        <div className={styles.header}>
          <p className={styles.eyebrow}>Cart preview</p>

          <div className={styles.headerRow}>
            <div>
              <h3 className={styles.title} id="cart-preview-title">Giỏ hàng của bạn</h3>
              <p className={styles.subtitle}>{totalQuantity} sản phẩm đang chờ thanh toán</p>
            </div>

            <div className={styles.headerActions}>
              <p className={styles.totalBadge}>{formatCurrency(cartTotal)}</p>

              <button
                aria-label="Đóng giỏ hàng"
                className={styles.closeButton}
                onClick={onClose}
                type="button"
              >
                <FontAwesomeIcon aria-hidden="true" icon={faXmark} />
              </button>
            </div>
          </div>
        </div>

        {showLoadingState ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Đang tải giỏ hàng</p>
            <p className={styles.emptyText}>Dữ liệu giỏ hàng của bạn đang được đồng bộ.</p>
          </div>
        ) : showErrorState ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Không thể tải giỏ hàng</p>
            <p className={styles.emptyText}>Hãy thử mở lại preview sau ít giây nữa.</p>
          </div>
        ) : showEmptyState ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Giỏ hàng đang trống</p>
            <p className={styles.emptyText}>Thêm vài sản phẩm để preview giỏ hàng xuất hiện ở đây.</p>
          </div>
        ) : (
          <>
            <div className={styles.content}>
              <div className={styles.itemList}>
                {visibleItems.map((item) => {
                  const itemTotal = item.quantity * item.unitPrice

                  return (
                    <article key={item.id} className={styles.itemCard}>
                      <div
                        className={styles.thumbnail}
                        style={item.thumbnail ? {
                          backgroundImage: `url(${item.thumbnail})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        } : undefined}
                      >
                        {!item.thumbnail ? getProductInitials(item.name) : null}
                      </div>

                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemMeta}>
                          SL: {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                        <p className={styles.itemTotal}>{formatCurrency(itemTotal)}</p>
                      </div>
                    </article>
                  )
                })}

                {hiddenItemsCount > 0 ? (
                  <div className={styles.overflowNotice}>
                    Còn {hiddenItemsCount} sản phẩm khác trong giỏ hàng.
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.footer}>
              <Link href="/cart" onClick={onClose} className={styles.action}>
                Xem trang giỏ hàng
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
