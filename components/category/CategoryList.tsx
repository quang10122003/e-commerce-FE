"use client"

import { useEffect, useRef, useState } from "react"
import { useGetCategoriesQuery } from "@/features/category/categoryApi"
import { Category } from "@/types/category/Category"
import CategoryCard from "./CategoryCard"
import styles from "@/styles/CategoryList.module.css"

type DragState = {
    isDragging: boolean
    startX: number
    scrollLeft: number
}

export default function CategoryList() {
    const { data } = useGetCategoriesQuery()
    const categories: Category[] = data?.data ?? []
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const dragStateRef = useRef<DragState>({
        isDragging: false,
        startX: 0,
        scrollLeft: 0,
    })
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        function handleWindowMouseMove(event: MouseEvent) {
            const container = scrollContainerRef.current

            if (!container || !dragStateRef.current.isDragging) {
                return
            }

            event.preventDefault()
            const pointerOffset = event.clientX - container.getBoundingClientRect().left
            const dragDistance = pointerOffset - dragStateRef.current.startX
            container.scrollLeft = dragStateRef.current.scrollLeft - dragDistance
        }

        function handleWindowMouseUp() {
            dragStateRef.current.isDragging = false
            setIsDragging(false)
        }

        window.addEventListener("mousemove", handleWindowMouseMove)
        window.addEventListener("mouseup", handleWindowMouseUp)

        return () => {
            window.removeEventListener("mousemove", handleWindowMouseMove)
            window.removeEventListener("mouseup", handleWindowMouseUp)
        }
    }, [])

    function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
        if (event.button !== 0) {
            return
        }

        const container = scrollContainerRef.current

        if (!container) {
            return
        }

        event.preventDefault()

        // Lưu lại vị trí bắt đầu kéo để mô phỏng hành vi "drag to scroll".
        dragStateRef.current = {
            isDragging: true,
            startX: event.clientX - container.getBoundingClientRect().left,
            scrollLeft: container.scrollLeft,
        }
        setIsDragging(true)
    }

    return (
        <section className={styles.categoryList}>
            <h1>Danh mục sản phẩm</h1>

            <div
                ref={scrollContainerRef}
                className={`${styles.categoryList__content} ${isDragging ? styles.categoryList__contentDragging : ""}`}
                onMouseDown={handleMouseDown}
                onDragStart={(event) => event.preventDefault()}
            >
                {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
        </section>
    )
}
