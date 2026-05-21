"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/cn"

type ProductDetailGalleryProps = {
  images: string[]
}

export default function ProductDetailGallery({ images }: ProductDetailGalleryProps) {
  const [activeImage, setActiveImage] = useState(0)

  const currentImage = images[activeImage] ?? images[0]
  const hasMultipleImages = images.length > 1

  function handlePreviousImage() {
    setActiveImage((currentIndex) => (currentIndex === 0 ? images.length - 1 : currentIndex - 1))
  }

  function handleNextImage() {
    setActiveImage((currentIndex) => (currentIndex === images.length - 1 ? 0 : currentIndex + 1))
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="relative overflow-hidden rounded-[16px] border border-border bg-slate-50">
          <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
            <ImageIcon className="size-3.5" />
            Product view
          </div>

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
                aria-label="View previous image"
              >
                <ChevronLeft className="size-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                {activeImage + 1} / {images.length}
              </div>

              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-slate-700 transition-colors hover:bg-primary-soft hover:text-primary"
                aria-label="View next image"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          ) : null}

          <Image
            width={900}
            height={900}
            alt=""
            className="aspect-[4/4.2] w-full object-cover sm:aspect-[4/3.75]"
            src={currentImage}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(index)}
              className={cn(
                "overflow-hidden rounded-[12px] border bg-slate-50 transition-colors",
                activeImage === index
                  ? "border-[#bfd2f6] bg-primary-soft"
                  : "border-border hover:border-[#bfd2f6]"
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
