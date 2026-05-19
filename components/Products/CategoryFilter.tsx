"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Category } from "@/types/category/Category"

type CategoryFilterProps = {
  categories: Category[]
  onSelectCategory: (categoryId?: number) => void
  selectedCategoryId?: number
}

export default function CategoryFilter({
  categories,
  onSelectCategory,
  selectedCategoryId,
}: CategoryFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId)

  useEffect(() => {
    function handleClickOutside(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("pointerdown", handleClickOutside)

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside)
    }
  }, [])

  function handleChangeCategory(value?: number) {
    onSelectCategory(value)
    setIsDropdownOpen(false)
  }

  return (
    <div className="surface-primary p-5">
      <div className="space-y-2">
        <p className="section-kicker">Bộ lọc</p>
        <h2 className="text-[18px] font-semibold text-slate-950">Danh mục sản phẩm</h2>
        <p className="text-sm leading-6 text-slate-600">
          Chọn nhóm sản phẩm để danh sách hiển thị gọn hơn.
        </p>
      </div>

      <div className="mt-5 hidden lg:grid lg:gap-2">
        <button
          className={cn(
            "rounded-[12px] border px-4 py-3 text-left text-sm font-medium transition-colors",
            selectedCategoryId === undefined
              ? "border-[#bfd2f6] bg-primary-soft text-primary"
              : "border-border bg-white text-slate-700 hover:bg-primary-soft hover:text-primary"
          )}
          onClick={() => handleChangeCategory(undefined)}
          type="button"
        >
          Tất cả
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            className={cn(
              "rounded-[12px] border px-4 py-3 text-left text-sm font-medium transition-colors",
              selectedCategoryId === category.id
                ? "border-[#bfd2f6] bg-primary-soft text-primary"
                : "border-border bg-white text-slate-700 hover:bg-primary-soft hover:text-primary"
            )}
            onClick={() => handleChangeCategory(category.id)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="mt-5 lg:hidden">
        <label className="mb-2 block text-sm font-medium text-slate-600">Chọn danh mục</label>
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between rounded-[12px] border border-border bg-white px-4 py-3 text-left text-sm font-medium text-slate-900"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            onClick={() => setIsDropdownOpen((previousValue) => !previousValue)}
          >
            <span className="truncate">{selectedCategory?.name ?? "Tất cả"}</span>
            <ChevronDown
              className={cn(
                "ml-3 size-4 shrink-0 text-slate-400 transition-transform",
                isDropdownOpen && "rotate-180 text-primary"
              )}
            />
          </button>

          {isDropdownOpen ? (
            <ul
              className="surface-overlay absolute inset-x-0 top-[calc(100%+0.375rem)] z-20 max-h-[70vh] overflow-y-auto p-2"
              role="listbox"
            >
              <li>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-[12px] px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary-soft hover:text-primary",
                    selectedCategoryId === undefined
                      ? "bg-primary-soft font-medium text-primary"
                      : "text-slate-700"
                  )}
                  onClick={() => handleChangeCategory(undefined)}
                >
                  Tất cả
                </button>
              </li>

              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-[12px] px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary-soft hover:text-primary",
                      selectedCategoryId === category.id
                        ? "bg-primary-soft font-medium text-primary"
                        : "text-slate-700"
                    )}
                    onClick={() => handleChangeCategory(category.id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}
