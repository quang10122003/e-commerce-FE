import { ImageOff } from "lucide-react"

import { cn } from "@/lib/cn"

type BrokenImageFallbackProps = {
  className?: string
  label?: string
}

export default function BrokenImageFallback({
  className,
  label = "Ảnh chưa có",
}: BrokenImageFallbackProps) {
  return (
    // Khung hiển thị khi ảnh bị thiếu hoặc backend trả src rỗng.
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-100 text-slate-400",
        className
      )}
    >
      <ImageOff className="size-8" />
      <span className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</span>
    </div>
  )
}
