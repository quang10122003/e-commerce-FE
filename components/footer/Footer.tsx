import Link from "next/link"
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import Container from "@/components/shared/Container"

const QUICK_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/cart", label: "Giỏ hàng" },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-slate-950 py-14 text-slate-200 sm:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">MyShop</h2>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              MyShop là nơi mua sắm trực tuyến dành cho những ai muốn tìm sản phẩm
              chất lượng với trải nghiệm duyệt nhanh, thanh toán an toàn và hỗ trợ tận tâm.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Liên kết nhanh</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Kết nối</h2>
            <div className="mt-4 flex gap-3">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                href="https://google.com"
                aria-label="Google"
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <FontAwesomeIcon icon={faGoogle} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          © 2026 - Bản quyền thuộc về MyShop
        </div>
      </Container>
    </footer>
  )
}
