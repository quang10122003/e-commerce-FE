import CategoryList from "@/components/home/CategoryList"
import HeroSection from "@/components/home/HeroSection"
import TopSellingProducts from "@/components/Products/TopSellingProducts"
import Container from "@/components/shared/Container"
import type { Category } from "@/types/category/Category"
import type { ProductType } from "@/types/product/ProductsummerType"

type HomeSectionsProps = {
  categories: Category[]
  topSellingProducts: ProductType[]
  hasCategoriesError?: boolean
  hasTopSellingProductsError?: boolean
}

function renderCategoryListSkeleton() {
  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <div className="h-3 w-32 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="h-8 w-72 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-slate-200/80 animate-pulse" />
      </div>

      <div className="surface-primary flex gap-4 overflow-x-auto px-4 py-5 sm:px-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="w-40 shrink-0 space-y-3">
            <div className="aspect-4/3 rounded-[16px] bg-slate-200/80" />
            <div className="h-4 rounded-full bg-slate-200/80" />
            <div className="h-3 w-2/3 rounded-full bg-slate-200/80" />
          </div>
        ))}
      </div>
    </section>
  )
}

function renderTopSellingProductsSkeleton() {
  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="h-8 w-80 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-slate-200/80 animate-pulse" />
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(235px,1fr))]">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-[10px] border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="aspect-[4/4.8] rounded-[10px] bg-slate-200/80" />
            <div className="mt-4 space-y-3">
              <div className="h-4 rounded-full bg-slate-200/80" />
              <div className="h-3 w-5/6 rounded-full bg-slate-200/80" />
              <div className="h-10 rounded-[12px] bg-slate-200/80" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomeSections({
  categories,
  topSellingProducts,
  hasCategoriesError,
  hasTopSellingProductsError,
}: HomeSectionsProps) {
  return (
    <Container className="space-y-6 py-6 sm:space-y-8 sm:py-8 lg:space-y-10 lg:py-10">
      <HeroSection />

      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {categories.length > 0 ? (
          <CategoryList categories={categories} />
        ) : hasCategoriesError ? (
          renderCategoryListSkeleton()
        ) : null}

        {topSellingProducts.length > 0 ? (
          <TopSellingProducts products={topSellingProducts} />
        ) : hasTopSellingProductsError ? (
          renderTopSellingProductsSkeleton()
        ) : null}
      </div>
    </Container>
  )
}
