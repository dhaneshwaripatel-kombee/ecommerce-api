import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white shadow-glow-red",
        secondary:
          "border-transparent bg-white/10 text-white",
        destructive:
          "border-transparent bg-destructive text-white shadow",
        outline: "text-slate-400 border-white/10",
        success: "border-transparent bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
        warning: "border-transparent bg-amber-500/20 text-amber-400 border border-amber-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
