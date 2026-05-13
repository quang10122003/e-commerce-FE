import CategoryList from "@/components/home/CategoryList"
import HeroSection from "@/components/home/HeroSection"
import TopSellingProducts from "@/components/Products/TopSellingProducts"
import Container from "@/components/shared/Container"

export default function HomeSections() {
  return (
    <Container className="space-y-6 py-6 sm:space-y-8 sm:py-8 lg:space-y-10 lg:py-10">
      <HeroSection />
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <CategoryList />
        <TopSellingProducts />
      </div>
    </Container>
  )
}
