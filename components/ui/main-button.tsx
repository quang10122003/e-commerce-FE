"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react"

import { cn } from "@/lib/utils"

const mainButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium",
    "transition-all duration-200 outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60",
  ],
  {
    variants: {
      size: {
        small: "h-9 px-4 text-sm",
        medium: "h-11 px-6 text-base",
        large: "h-12 px-7 text-base sm:px-8 sm:text-lg",
      },
      variant: {
        primary: "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
        secondary:
          "border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:bg-slate-50",
        outline:
          "border border-slate-300 bg-transparent text-slate-900 hover:border-slate-400 hover:bg-slate-50",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      size: "medium",
      variant: "primary",
    },
  }
)

type MainButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof mainButtonVariants> & {
    text?: string
    children?: ReactNode
  }

const MainButton = forwardRef<HTMLButtonElement, MainButtonProps>(
  (
    {
      text,
      children,
      size,
      variant,
      className,
      fullWidth,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(mainButtonVariants({ size, variant, fullWidth }), className)}
        {...props}
      >
        {children ?? text}
      </button>
    )
  }
)

MainButton.displayName = "MainButton"

export default MainButton
export { mainButtonVariants }
