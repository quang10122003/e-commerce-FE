import Link from "next/link"

import { Category } from "@/types/category/Category"
import { cn } from "@/lib/utils"

type CategoryCardProps = {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="group flex shrink-0 flex-col items-center gap-3 text-center text-slate-900"
    >
      <div
        className={cn(
          "size-24 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-orange-300 group-hover:shadow-lg",
          "sm:size-32 md:size-36"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <p className="max-w-28 text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-950 sm:max-w-32">
        {category.name}
      </p>
    </Link>
  )
}
