"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react"

import { cn } from "@/lib/cn"

const mainButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border text-sm font-semibold",
    "transition-colors duration-150 outline-none",
    "focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-0",
    "focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60",
  ],
  {
    variants: {
      size: {
        small: "h-9 px-4 text-sm",
        medium: "h-11 px-5 text-sm",
        large: "h-12 px-6 text-[15px]",
      },
      variant: {
        primary:
          "border-transparent bg-primary text-primary-foreground hover:brightness-[1.03] active:brightness-[0.98]",
        secondary:
          "border-border bg-white text-slate-700 shadow-none hover:border-[#bfd2f6] hover:bg-primary-soft hover:text-primary",
        outline: "border-border bg-transparent text-slate-700 hover:bg-white hover:text-slate-950",
        ghost: "border-transparent bg-transparent text-slate-600 hover:bg-primary-soft hover:text-primary",
        dangerSoft:
          "border-[#f3c9c9] bg-danger-soft text-[#b42318] hover:border-[#efb4b4] hover:bg-[#ffe0e0]",
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
