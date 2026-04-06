"use client"

import { useEffect } from "react"
import Link from "next/link"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useAppSelector } from "@/app/hooks"
import { useGetCartQuery } from "@/features/auth/tokenApi"
import styles from "@/styles/CartSidebar.module.css"

type CartSidebarProps = {
  isOpen?: boolean
  onClose?: () => void
}

const MAX_VISIBLE_ITEMS = 4 

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function getProductInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export default function CartSidebar({ isOpen = false, onClose }: CartSidebarProps) {
  const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      onClose?.()
    }
  }, [isAuthenticated, isOpen, onClose])

  const { data, error, isFetching, isLoading } = useGetCartQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !isOpen || !isAuthenticated || isCheckingAuth,
  })

  // lấy data
  const cartData = data?.data
  // hiển thị 4 sản phẩm thêm vào mới nhất
  const visibleItems = (cartData?.items ?? []).slice(0, MAX_VISIBLE_ITEMS)
  // số sản phẩm bị ẩn
  const hiddenItemsCount = Math.max((cartData?.items?.length ?? 0) - visibleItems.length, 0)
  // biến loading 
  const showLoadingState = isOpen && isAuthenticated && (isLoading || isFetching)

  const showErrorState = !showLoadingState && Boolean(error)

  const showEmptyState = !showLoadingState && !showErrorState && (cartData?.items?.length ?? 0) === 0

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
              <p className={styles.subtitle}>{cartData?.totalQuantity ?? 0} sản phẩm đang chờ thanh toán</p>
            </div>

            <div className={styles.headerActions}>
              <p className={styles.totalBadge}>{formatCurrency(cartData?.totalAmount ?? 0)}</p>

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
                {visibleItems.map((item) => (
                  <article key={item.productId} className={styles.itemCard}>
                    <div
                      className={styles.thumbnail}
                      style={item.thumbnail ? {
                        backgroundImage: `url(${item.thumbnail})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      } : undefined}
                    >
                      {!item.thumbnail ? getProductInitials(item.productName) : null}
                    </div>

                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.productName}</p>
                      <p className={styles.itemMeta}>
                        SL: {item.quantity} x {formatCurrency(item.unitPrice)}
                      </p>
                      <p className={styles.itemTotal}>{formatCurrency(item.totalPrice)}</p>
                    </div>
                  </article>
                ))}

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
