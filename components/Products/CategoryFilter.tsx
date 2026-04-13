"use client"

import { useEffect, useRef, useState } from "react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useGetCategoriesQuery } from "@/features/category/categoryApi"
import { cn } from "@/lib/utils"
import { Category } from "@/types/category/Category"

const ALL_CATEGORY_VALUE = "all"

type CategoryFilterProps = {
  onSelectCategory: (categoryId?: number) => void
  selectedCategoryId?: number
}

export default function CategoryFilter({
  onSelectCategory,
  selectedCategoryId,
}: CategoryFilterProps) {
  const { data, isLoading } = useGetCategoriesQuery()
  const categories: Category[] = data?.data ?? []
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

  function handleChangeCategory(value: string) {
    onSelectCategory(value === ALL_CATEGORY_VALUE ? undefined : Number(value))
  }

  function handleSelectFromDropdown(categoryId?: number) {
    onSelectCategory(categoryId)
    setIsDropdownOpen(false)
  }

  if (isLoading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
        Đang tải danh mục...
      </div>
    )
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)]">
      <h2 className="mb-4 text-lg font-semibold text-slate-950">Danh mục sản phẩm</h2>

      <div className="hidden lg:block">
        <RadioGroup
          className="max-h-[70vh] gap-3 overflow-y-auto pr-1 [scrollbar-width:thin]"
          value={selectedCategoryId === undefined ? ALL_CATEGORY_VALUE : String(selectedCategoryId)}
          onValueChange={handleChangeCategory}
        >
          <Label
            htmlFor="radio-all"
            className={cn(
              "min-h-12 cursor-pointer rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-lg",
              selectedCategoryId === undefined &&
                "border-sky-200 bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_100%)] text-sky-900 shadow-md"
            )}
          >
            <RadioGroupItem value={ALL_CATEGORY_VALUE} id="radio-all" className="mt-0.5" />
            <span className="flex-1">Tất cả</span>
          </Label>

          {categories.map((category) => (
            <Label
              key={category.id}
              htmlFor={`radio-${category.id}`}
              className={cn(
                "min-h-12 cursor-pointer rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-lg",
                selectedCategoryId === category.id &&
                  "border-sky-200 bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_100%)] text-sky-900 shadow-md"
              )}
            >
              <RadioGroupItem
                value={String(category.id)}
                id={`radio-${category.id}`}
                className="mt-0.5"
              />
              <span className="flex-1 leading-6">{category.name}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="grid gap-2 lg:hidden">
        <label className="text-sm font-medium text-slate-600">Chọn danh mục</label>
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-900"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            onClick={() => setIsDropdownOpen((previousValue) => !previousValue)}
          >
            <span className="truncate">{selectedCategory?.name ?? "Tất cả"}</span>
            <span
              className={cn(
                "ml-3 size-2.5 shrink-0 rotate-45 border-b-2 border-r-2 border-slate-400 transition-transform",
                isDropdownOpen && "-rotate-135"
              )}
            />
          </button>

          {isDropdownOpen ? (
            <ul
              className="absolute inset-x-0 top-[calc(100%+0.375rem)] z-20 max-h-[70vh] overflow-y-auto rounded-[20px] border border-slate-200 bg-white p-2 shadow-xl"
              role="listbox"
            >
              <li>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-2xl px-3 py-2.5 text-left text-sm transition hover:bg-sky-50 hover:text-sky-700",
                    selectedCategoryId === undefined
                      ? "bg-sky-50 font-medium text-sky-700"
                      : "text-slate-700"
                  )}
                  onClick={() => handleSelectFromDropdown(undefined)}
                >
                  Tất cả
                </button>
              </li>

              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    className={cn(
                      "w-full rounded-2xl px-3 py-2.5 text-left text-sm transition hover:bg-sky-50 hover:text-sky-700",
                      selectedCategoryId === category.id
                        ? "bg-sky-50 font-medium text-sky-700"
                        : "text-slate-700"
                    )}
                    onClick={() => handleSelectFromDropdown(category.id)}
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
