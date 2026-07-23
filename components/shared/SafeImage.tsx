"use client"

import Image, { type ImageProps } from "next/image"
import { useEffect, useState } from "react"

import BrokenImageFallback from "@/components/shared/BrokenImageFallback"
import { cn } from "@/lib/cn"
import { hasImageSrc } from "@/lib/images"

type SafeImageProps = Omit<ImageProps, "src"> & {
  src?: string | null
  fallbackClassName?: string
  fallbackLabel?: string
}

export default function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackLabel,
  loading = "lazy",
  decoding = "async",
  quality = 75,
  onLoad,
  unoptimized = true,
  onError,
  priority,
  ...props
}: SafeImageProps) {
  // State đánh dấu ảnh bị lỗi để chuyển sang khung fallback.
  const [hasError, setHasError] = useState(false)
  // State theo dõi ảnh đã tải xong để chuyển opacity mượt hơn.
  const [hasLoaded, setHasLoaded] = useState(false)
  const imageSrc = hasImageSrc(src) ? src : null

  useEffect(() => {
    setHasError(false)
    setHasLoaded(false)
  }, [imageSrc])

  if (!imageSrc || hasError) {
    return <BrokenImageFallback className={fallbackClassName ?? className} label={fallbackLabel} />
  }

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      className={cn(
        "transition-opacity duration-300 ease-out",
        hasLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      loading={priority ? undefined : loading}
      decoding={decoding}
      quality={quality}
      unoptimized={unoptimized}
      priority={priority}
      onLoad={(event) => {
        setHasLoaded(true)
        onLoad?.(event)
      }}
      onError={(event) => {
        setHasError(true)
        onError?.(event)
      }}
    />
  )
}
