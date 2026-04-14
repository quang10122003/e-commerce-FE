"use client"
import ProductDetailBreadcrumb from "@/components/Products/detail/ProductDetailBreadcrumb"
import ProductDetailGallery from "@/components/Products/detail/ProductDetailGallery"
import ProductDetailOverview from "@/components/Products/detail/ProductDetailOverview"
import ProductDetailPurchaseCard from "@/components/Products/detail/ProductDetailPurchaseCard"
import ProductDetailSpecifications from "@/components/Products/detail/ProductDetailSpecifications"
import ProductDetailSummary from "@/components/Products/detail/ProductDetailSummary"
import Container from "@/components/shared/Container"
import { useGetProductByIdQuery } from "@/features/product/productApi"
import { ProductDetail } from "@/types/product/productDeteilType"

type ProductDetailClientProps = {
    id: number
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {

    const { data } = useGetProductByIdQuery(id)
    // return null nếu ko có data
    if (!data?.data) return null

    // if (data?.data.status === "INACTIVE") {
    //     return (
    //         <div>
    //             sản phẩm này đã bị ẩn hiện k thể hiển thị
    //         </div>
    //     )
    // }
    const productdata: ProductDetail = data?.data;
    const listImage: string[] = [productdata.thumbnail, ...productdata.url]
    // du lieu mock
    //   const product: ProductDetail = {
    //     id,
    //     name: "Nike Air Max Pulse Premium",
    //     purchases: 248,
    //     description:
    //       "Phien ban sneaker premium cho nhu cau di chuyen moi ngay. Form giay gon, de em, de phoi do va phu hop cho ca di hoc, di lam va di choi.",
    //     price: 3290000,
    //     stock: 18,
    //     status: "ACTIVE",
    //     nameCategory: "12",
    //     thumbnail:
    //       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    //     url: [
    //       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    //       "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1200&q=80",
    //       "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
    //       "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1200&q=80",
    //     ],
    //   }

    return (
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_72%)]">
            <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.7))]" />

            <Container className="relative py-8 sm:py-10 lg:py-14">
                <div className="space-y-8">
                    {/* dieu huong */}
                    <ProductDetailBreadcrumb
                        categoryName="Sneakers"
                        productName={productdata.name}
                    />

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-start">
                        <ProductDetailGallery images = {listImage} />

                        <div className="grid gap-6">
                            <ProductDetailSummary product={productdata} />
                            <ProductDetailPurchaseCard product={productdata} />
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
                        <ProductDetailOverview product={productdata} />
                        <ProductDetailSpecifications product={productdata} />
                    </div>
                </div>
            </Container>
        </section>
    )
}
