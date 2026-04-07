import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import styles from "@/styles/PaginationStyle.module.css"
type PaginationProps = {
    // page hiện tại 
    currentPage: number,
    // tổng số page
    totalPage: number,
    // 
    onPageChange?: (page: number) => void;
}
export default function Pagination({ currentPage, totalPage, onPageChange }: PaginationProps) {
    // số trang hiện thị 1 lần 
    const pageGroupSize = 4
    // tổng số trang 
    const normalizedTotalPage = Math.max(totalPage, 0)
    // trang hiện tại
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(normalizedTotalPage, 1))
    // trang bắt đầu của nhóm trang hiển thị
    const groupStartPage = Math.floor((safeCurrentPage - 1) / pageGroupSize) * pageGroupSize + 1
    // trang kết thúc của nhóm trang hiển thị
    const groupEndPage = Math.min(groupStartPage + pageGroupSize - 1, normalizedTotalPage)
    // list số trang hiển thị 
    const visiblePages = Array.from(
        { length: Math.max(groupEndPage - groupStartPage + 1, 0) },
        (_, index) => groupStartPage + index
    )
    const isFirstPage = safeCurrentPage === 1
    const isLastPage = safeCurrentPage === normalizedTotalPage || normalizedTotalPage <= 1

    function handlePageChange(page: number) {
        if (page < 1 || page > normalizedTotalPage || page === safeCurrentPage) {
            return
        }

        onPageChange?.(page)
    }

    if (normalizedTotalPage === 0) {
        return null
    }

    return (
        <div className={styles.pagination}>
            <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={isFirstPage}
                aria-label="Trang truoc"
                className={isFirstPage ? styles["pagination__icon--disiale"] : styles.pagination__icon}
            >
                <FontAwesomeIcon icon={faAngleLeft} />
            </button>

            {visiblePages.map((page) => (
                <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={page === safeCurrentPage
                        ? styles["pagination__item--active"]
                        : styles.pagination__item}
                    aria-current={page === safeCurrentPage ? "page" : undefined}
                >
                    {page}
                </button>
            ))}

            {groupEndPage < normalizedTotalPage && (
                <span className={styles.pagination__ellipsis} aria-hidden="true">
                    ...
                </span>
            )}

            <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                disabled={isLastPage}
                aria-label="Trang sau"
                className={isLastPage ? styles["pagination__icon--disiale"] : styles.pagination__icon}
            >
                <FontAwesomeIcon icon={faAngleRight} />
            </button>
        </div>
    )
}
