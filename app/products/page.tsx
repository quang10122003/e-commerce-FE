import { Suspense } from "react"
import ProductCatalog from "@/components/Products/ProductCatalog"
import Container from "@/components/shared/Container"
import Loading from "@/components/shared/Loading"

export default function Page() {
  return (
    <Container>
      <Suspense fallback={<Loading />}>
        <ProductCatalog />
      </Suspense>
    </Container>
  )
}
