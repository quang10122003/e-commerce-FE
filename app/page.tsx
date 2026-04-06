import CategoryList from "@/components/category/CategoryList"
import Footer from "@/components/Footer"
import Hero from "@/components/Hero"
import TopSellingProducts from "@/components/Products/TopSellingProducts"

export default function Home() {
  return (
    <>
      <Hero />
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        <CategoryList />
        <TopSellingProducts />
      </div>
      <Footer />
    </>
  )
}
