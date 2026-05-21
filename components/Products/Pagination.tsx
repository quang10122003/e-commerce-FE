import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/cn"

type PaginationProps = {
  currentPage: number
  totalPage: number
  onPageChange?: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPage,
  onPageChange,
}: PaginationProps) {
  const pageGroupSize = 4
  const normalizedTotalPage = Math.max(totalPage, 0)
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(normalizedTotalPage, 1))
  const groupStartPage = Math.floor((safeCurrentPage - 1) / pageGroupSize) * pageGroupSize + 1
  const groupEndPage = Math.min(groupStartPage + pageGroupSize - 1, normalizedTotalPage)
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
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => handlePageChange(safeCurrentPage - 1)}
        disabled={isFirstPage}
        aria-label="Trang trước"
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-[12px] border border-border bg-white text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary",
          isFirstPage && "cursor-not-allowed opacity-50 hover:bg-white hover:text-slate-600"
        )}
      >
        <ChevronLeft className="size-4.5" />
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => handlePageChange(page)}
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-[12px] border text-sm font-semibold transition-colors",
            page === safeCurrentPage
              ? "border-[#bfd2f6] bg-primary-soft text-primary"
              : "border-border bg-white text-slate-600 hover:bg-primary-soft hover:text-primary"
          )}
          aria-current={page === safeCurrentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {groupEndPage < normalizedTotalPage ? (
        <span className="px-1 text-lg font-medium text-slate-400" aria-hidden="true">
          ...
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => handlePageChange(safeCurrentPage + 1)}
        disabled={isLastPage}
        aria-label="Trang sau"
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-[12px] border border-border bg-white text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary",
          isLastPage && "cursor-not-allowed opacity-50 hover:bg-white hover:text-slate-600"
        )}
      >
        <ChevronRight className="size-4.5" />
      </button>
    </div>
  )
}
