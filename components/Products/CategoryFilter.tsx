"use client"

import { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useGetCategoriesQuery } from "@/features/category/categoryApi"
import { Category } from "@/types/category/Category"
import styles from "@/styles/CategoryFilter.module.css"

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    // Tim label dang duoc chon de desktop radio va mobile dropdown cung hien thi cung mot gia tri.
    const selectedCategory = categories.find((category) => category.id === selectedCategoryId)

    useEffect(() => {
        function handleClickOutside(event: PointerEvent) {
            if (!dropdownRef.current?.contains(event.target as Node)) {
                setIsMobileMenuOpen(false)
            }
        }

        document.addEventListener("pointerdown", handleClickOutside)

        return () => {
            document.removeEventListener("pointerdown", handleClickOutside)
        }
    }, [])

    function handleChangeCategory(value: string) {
        // RadioGroup lam viec voi string, nen can doi "all" ve undefined va id ve number.
        onSelectCategory(value === ALL_CATEGORY_VALUE ? undefined : Number(value))
    }

    function handleSelectOnMobile(categoryId?: number) {
        // Mobile menu su dung button rieng, nen dong menu ngay sau khi chon de UX gon hon.
        onSelectCategory(categoryId)
        setIsMobileMenuOpen(false)
    }

    if (isLoading) {
        return <div className={styles.categoryFilter}>Đang tải danh mục...</div>
    }

    return (
        <div className={styles.categoryFilter}>
            <h1 className={styles.categoryFilter__title}>Danh mục sản phẩm</h1>

            <div className={styles.categoryFilter__desktop}>
                <RadioGroup
                    className={styles.categoryFilter__desktopGroup}
                    value={selectedCategoryId === undefined ? ALL_CATEGORY_VALUE : String(selectedCategoryId)}
                    onValueChange={handleChangeCategory}
                >
                    <Label
                        htmlFor="radio-all"
                        className={styles.categoryFilter__option}
                        data-selected={selectedCategoryId === undefined}
                    >
                        <RadioGroupItem
                            className={styles.categoryFilter__radio}
                            value={ALL_CATEGORY_VALUE}
                            id="radio-all"
                        />
                        <span className={styles.categoryFilter__optionText}>Tất cả</span>
                    </Label>

                    {categories.map((category) => (
                        <Label
                            key={category.id}
                            htmlFor={`radio-${category.id}`}
                            className={styles.categoryFilter__option}
                            data-selected={selectedCategoryId === category.id}
                        >
                            <RadioGroupItem
                                className={styles.categoryFilter__radio}
                                value={String(category.id)}
                                id={`radio-${category.id}`}
                            />
                            <span className={styles.categoryFilter__optionText}>{category.name}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>

            <div className={styles.categoryFilter__mobile}>
                <label className={styles.categoryFilter__selectLabel}>Chọn danh mục</label>

                <div
                    ref={dropdownRef}
                    className={styles.categoryFilter__selectWrap}
                    data-open={isMobileMenuOpen}
                >
                    <button
                        type="button"
                        className={styles.categoryFilter__select}
                        onClick={() => setIsMobileMenuOpen((previousValue) => !previousValue)}
                    >
                        {selectedCategory?.name ?? "Tất cả"}
                    </button>

                    {isMobileMenuOpen && (
                        <ul className={styles.categoryFilter__menu}>
                            <li>
                                <button
                                    type="button"
                                    className={styles.categoryFilter__menuItem}
                                    onClick={() => handleSelectOnMobile(undefined)}
                                >
                                    Tất cả
                                </button>
                            </li>

                            {categories.map((category) => (
                                <li key={category.id}>
                                    <button
                                        type="button"
                                        className={styles.categoryFilter__menuItem}
                                        onClick={() => handleSelectOnMobile(category.id)}
                                    >
                                        {category.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
