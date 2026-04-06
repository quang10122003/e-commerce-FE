import Link from "next/link"
import { faFacebookF, faGoogle } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@/styles/Footer.module.css"

const QUICK_LINKS = [
    { href: "/", label: "Trang chủ" },
    { href: "/products", label: "Sản phẩm" },
    { href: "/cart", label: "Giỏ hàng" },
]

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__content}>
                <div className={styles.footer__item}>
                    <h2>MyShop</h2>
                    <p className={styles.footer__description}>
                        MyShop là nơi mua sắm trực tuyến dành cho những ai muốn tìm sản phẩm
                        chất lượng với trải nghiệm duyệt nhanh, thanh toán an toàn và hỗ trợ
                        tận tâm.
                    </p>
                </div>

                <div className={styles.footer__item}>
                    <h2>Liên kết nhanh</h2>
                    <ul className={styles.footer__linkList}>
                        {QUICK_LINKS.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.footer__item}>
                    <h2>Kết nối</h2>
                    <div className={styles.footer__socialList}>
                        <FontAwesomeIcon icon={faFacebookF} className={styles.footer__icon} />
                        <FontAwesomeIcon icon={faGoogle} className={styles.footer__icon} />
                    </div>
                </div>
            </div>

            <div className={styles.footer__copyright}>
                © 2026 - Bản quyền thuộc về MyShop
            </div>
        </footer>
    )
}
