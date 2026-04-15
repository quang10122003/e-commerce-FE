"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Image from "next/image"

type ProductDetailGalleryProps = {
  images: string[]
}

export default function ProductDetailGallery({
  images,
}: ProductDetailGalleryProps) {
  const [activeImage, setActiveImage] = useState(0)

  const currentImage = images[activeImage] ?? images[0]

  // check xem co nhieu hon 1 anh hay khong
  const hasMultipleImages = images.length > 1

  // lui anh
  function handlePreviousImage() {
    setActiveImage((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1
    )
  }

  // toi anh
  function handleNextImage() {
    setActiveImage((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1
    )
  }

  return (
    <Card className="overflow-hidden rounded-[28px] border-white/70 bg-white/90 backdrop-blur-sm">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="relative overflow-hidden rounded-[24px] bg-slate-100">
          {/* nhan anh */}
          <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 shadow-sm backdrop-blur">
            <ImageIcon className="size-3.5" />
            Product view
          </div>

          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="View previous image"
              >
                <ChevronLeft className="size-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-950/72 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                {activeImage + 1} / {images.length}
              </div>

              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="View next image"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          <Image
            width={400}
            height={400}
            alt=""
            className="aspect-4/4.5 w-full object-cover sm:aspect-[4/3.9]"
            src={currentImage}
          />
        </div>

        {/* anh nho */}
        <div className="hidden md:grid md:max-w-105 md:grid-cols-4 md:gap-2 lg:max-w-125">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={cn(
                "overflow-hidden rounded-[20px] border bg-slate-100 transition duration-200",
                activeImage === index
                  ? "border-slate-900 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.8)]"
                  : "border-slate-200 hover:border-slate-300"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                width={400}
                height={400}
                alt=""
                className="aspect-square w-full object-cover"
                src={image}
              />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}