"use client"

import { useEffect, useRef, useState } from "react"

import CategoryCard from "@/components/home/CategoryCard"
import { useGetCategoriesQuery } from "@/features/category/categoryApi"
import { cn } from "@/lib/utils"
import { Category } from "@/types/category/Category"

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
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX - container.getBoundingClientRect().left,
      scrollLeft: container.scrollLeft,
    }
    setIsDragging(true)
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Danh mục sản phẩm
        </h2>
      </div>

      <div
        ref={scrollContainerRef}
        className={cn(
          "flex gap-4 overflow-x-auto rounded-[10px] border border-orange-100 bg-[linear-gradient(180deg,#fff7f3_0%,#fffdfb_100%)] px-3 py-5 select-none sm:gap-6 sm:px-5",
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
