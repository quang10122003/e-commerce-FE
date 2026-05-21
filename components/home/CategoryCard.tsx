import Link from "next/link"

import { Category } from "@/types/category/Category"
import { cn } from "@/lib/cn"

type CategoryCardProps = {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="group flex w-[160px] shrink-0 flex-col gap-3 text-left text-slate-900 sm:w-[176px]"
    >
      <div
        className={cn(
          "overflow-hidden rounded-[16px] border border-border bg-slate-50 transition-colors duration-200 group-hover:border-[#bfd2f6] group-hover:bg-primary-soft"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.image}
          alt={category.name}
          className="aspect-[4/3] h-full w-full object-cover"
        />
      </div>
      <div className="space-y-1 px-1">
        <p className="line-clamp-2 text-sm font-semibold text-slate-900">{category.name}</p>
        <p className="text-xs font-medium text-slate-500">Xem sản phẩm</p>
      </div>
    </Link>
  )
}
