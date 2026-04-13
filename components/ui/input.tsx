"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200/70 disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
