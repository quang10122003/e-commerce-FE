import CategoryList from "@/components/home/CategoryList"
import HeroSection from "@/components/home/HeroSection"
import TopSellingProducts from "@/components/Products/TopSellingProducts"
import Container from "@/components/shared/Container"

export default function HomeSections() {
  return (
    <>
      <HeroSection />
      <Container className="space-y-14 py-12 sm:space-y-16 sm:py-16">
        <CategoryList />
        <TopSellingProducts />
      </Container>
    </>
  )
}
