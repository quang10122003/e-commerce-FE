import styles from "@/styles/Hero.module.css"

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles["hero__overlay"]}>
                <div className={styles["hero__content"]}>
                    <h1 className={styles["hero__title"]}>Welcome to MyShop</h1>

                    <p className={styles["hero__desc"]}>
                        Khám phá hàng ngàn sản phẩm chất lượng với giá tốt mỗi ngày
                    </p>

                    <div className={styles["hero__actions"]}>
                        <button
                            className={`${styles["hero__btn"]} ${styles["hero__btn--primary"]}`}
                        >
                            Mua ngay
                        </button>

                        <button
                            className={`${styles["hero__btn"]} ${styles["hero__btn--secondary"]}`}
                        >
                            Xem thêm
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}