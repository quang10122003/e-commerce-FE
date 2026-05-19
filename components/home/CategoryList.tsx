"use client"

import { useEffect, useRef, useState } from "react"

import CategoryCard from "@/components/home/CategoryCard"
import { cn } from "@/lib/utils"
import { Category } from "@/types/category/Category"

type DragState = {
  isDragging: boolean
  startX: number
  scrollLeft: number
}

type CategoryListProps = {
  categories: Category[]
}

export default function CategoryList({ categories }: CategoryListProps) {
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
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX - container.getBoundingClientRect().left,
      scrollLeft: container.scrollLeft,
    }
    setIsDragging(true)
  }

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <p className="section-kicker">Danh mục</p>
        <h2 className="section-title">Danh mục sản phẩm</h2>
        <p className="section-copy max-w-2xl">
          Các nhóm sản phẩm được gom gọn trong những surface sáng, nhẹ và dễ quét nhanh.
        </p>
      </div>

      <div
        ref={scrollContainerRef}
        className={cn(
          "surface-primary flex gap-4 overflow-x-auto px-4 py-5 select-none sm:gap-5 sm:px-5",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
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
