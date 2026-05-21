import { cn } from "@/lib/cn"

type ContainerProps = {
  children: React.ReactNode
  className?: string
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}
