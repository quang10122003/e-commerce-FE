import Link from "next/link"

import Container from "@/components/shared/Container"
import MainButton from "@/components/ui/main-button"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80")',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.88),rgba(2,6,23,0.56),rgba(2,6,23,0.78))]" />

      <Container className="relative flex min-h-110 items-center py-20 sm:min-h-135 sm:py-24 lg:min-h-155">
        <div className="max-w-3xl animate-in fade-in slide-in-from-top-10 duration-700 text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-orange-300">
            MyShop
          </p>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
            Welcome to MyShop
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg lg:text-2xl lg:leading-9">
            Khám phá hàng ngàn sản phẩm chất lượng với giá tốt mỗi ngày.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/products">
              <MainButton size="large">Mua ngay</MainButton>
            </Link>

            <Link href="/products">
              <MainButton
                size="large"
                variant="outline"
                className="border-white/70 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white/10 hover:text-white"
              >
                Xem thêm
              </MainButton>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}