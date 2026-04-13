import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

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
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
      <button
        type="button"
        onClick={() => handlePageChange(safeCurrentPage - 1)}
        disabled={isFirstPage}
        aria-label="Trang trước"
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950",
          isFirstPage && "cursor-not-allowed border-slate-100 text-slate-300 hover:border-slate-100 hover:text-slate-300"
        )}
      >
        <ChevronLeft className="size-5" />
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => handlePageChange(page)}
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-2xl border text-sm font-semibold transition",
            page === safeCurrentPage
              ? "border-sky-300 bg-sky-50 text-sky-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
          )}
          aria-current={page === safeCurrentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {groupEndPage < normalizedTotalPage ? (
        <span className="text-lg font-medium text-slate-400" aria-hidden="true">
          ...
        </span>
      ) : null}

      <button
        type="button"
        onClick={() => handlePageChange(safeCurrentPage + 1)}
        disabled={isLastPage}
        aria-label="Trang sau"
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950",
          isLastPage && "cursor-not-allowed border-slate-100 text-slate-300 hover:border-slate-100 hover:text-slate-300"
        )}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
