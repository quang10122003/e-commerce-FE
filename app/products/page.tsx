import { Suspense } from "react"
import Footer from "@/components/Footer"
import Loading from "@/components/Loading"
import ProductCatalog from "@/components/Products/ProductCatalog"

export default function Page() {
  return (
    <>
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        <Suspense fallback={<Loading />}>
          <ProductCatalog />
        </Suspense>
      </div>
      <Footer />
    </>
  )
}
