import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react"

import MainButton from "@/components/ui/main-button"

export default function HeroSection() {
  return (
    <section className="surface-primary overflow-hidden px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="section-kicker">Universal Commerce UI</p>
            <h1 className="max-w-3xl text-[36px] font-bold leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-[44px] lg:text-[56px]">
              Trải nghiệm mua sắm sáng, gọn và tập trung vào điều quan trọng.
            </h1>
            <p className="max-w-2xl text-[15px] leading-8 text-slate-600 sm:text-base">
              Khám phá danh mục rõ ràng, lựa chọn nhanh và theo dõi đơn hàng trong một giao diện
              nhẹ mắt, hiện đại và nhất quán trên mọi màn hình.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/products">
              <MainButton size="large">
                Mua ngay
                <ArrowRight className="size-4" />
              </MainButton>
            </Link>
            <Link href="/products">
              <MainButton size="large" variant="secondary">
                Xem danh mục
              </MainButton>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Danh mục chọn lọc",
                copy: "Sắp xếp rõ ràng, dễ duyệt và ít nhiễu thị giác.",
              },
              {
                icon: Truck,
                title: "Theo dõi đơn rõ ràng",
                copy: "Trạng thái đơn hàng hiển thị sáng rõ và nhất quán.",
              },
              {
                icon: ShieldCheck,
                title: "Mua sắm đáng tin cậy",
                copy: "Thông tin, giá và hành động luôn hiển thị mạch lạc.",
              },
            ].map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="surface-secondary p-4">
                  <span className="inline-flex size-10 items-center justify-center rounded-[12px] bg-primary-soft text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <h2 className="mt-4 text-base font-semibold text-slate-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.copy}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="surface-secondary overflow-hidden p-4 sm:p-5">
          <div className="relative overflow-hidden rounded-[16px] border border-border bg-white">
            <div className="absolute left-4 top-4 z-10 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Bộ sưu tập nổi bật
            </div>
            <Image
              width={900}
              height={900}
              alt="MyShop featured collection"
              className="aspect-[4/4.3] w-full object-cover"
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[16px] border border-border bg-white p-4">
              <p className="text-sm font-medium text-slate-500">Bắt đầu từ</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">299.000đ</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Nhiều lựa chọn phù hợp cho nhu cầu hằng ngày.
              </p>
            </div>
            <div className="rounded-[16px] border border-border bg-primary-soft p-4">
              <p className="text-sm font-medium text-primary">Ưu đãi tuần này</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Miễn phí ship</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Áp dụng cho đơn hàng đủ điều kiện trong thời gian khuyến mại.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
