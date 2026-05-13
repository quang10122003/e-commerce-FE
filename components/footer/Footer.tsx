import Link from "next/link"
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import Container from "@/components/shared/Container"

const QUICK_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/cart", label: "Giỏ hàng" },
  { href: "/order", label: "Đơn hàng" },
]

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border py-10 sm:py-12">
      <Container>
        <div className="surface-primary grid gap-8 px-5 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1.4fr_1fr_0.9fr]">
          <div className="space-y-4">
            <p className="section-kicker">MyShop</p>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Mua sắm sáng rõ, gọn gàng
              </h2>
              <p className="max-w-xl text-sm leading-7 text-slate-600">
                MyShop mang đến trải nghiệm mua sắm trực tuyến tinh gọn, dễ theo dõi đơn hàng
                và tập trung vào thông tin thật sự quan trọng.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">Liên kết nhanh</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">Kết nối</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Theo dõi ưu đãi mới và các cập nhật sản phẩm từ MyShop.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-white text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                href="https://google.com"
                aria-label="Google"
                className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-white text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <FontAwesomeIcon icon={faGoogle} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          © 2026 MyShop. Giao diện được refactor theo Universal UI Style Specification.
        </div>
      </Container>
    </footer>
  )
}
