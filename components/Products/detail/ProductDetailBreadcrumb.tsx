import Link from "next/link"
import { ChevronRight } from "lucide-react"

type ProductDetailBreadcrumbProps = {
  categoryName: string
  productName: string
}

export default function ProductDetailBreadcrumb({
  categoryName,
  productName,
}: ProductDetailBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
    >
      <Link className="font-medium text-slate-600 hover:text-slate-950" href="/">
        Home
      </Link>
      <ChevronRight className="size-4 text-slate-300" />
      <Link className="font-medium text-slate-600 hover:text-slate-950" href="/products">
        Products
      </Link>
      <ChevronRight className="size-4 text-slate-300" />
      <span className="font-medium text-sky-700">{categoryName}</span>
      <ChevronRight className="size-4 text-slate-300" />
      <span className="max-w-full truncate font-semibold text-slate-950">{productName}</span>
    </nav>
  )
}
