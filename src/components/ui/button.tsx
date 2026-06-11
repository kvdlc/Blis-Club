import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-cafe-600 text-white hover:bg-cafe-700 shadow-lg shadow-cafe-600/25 focus-visible:ring-cafe-500",
        outline:
          "border-2 border-cafe-300 text-cafe-700 hover:bg-cafe-50 focus-visible:ring-cafe-500",
        ghost: "text-cafe-600 hover:bg-cafe-50 focus-visible:ring-cafe-500",
        accent:
          "bg-cafe-400 text-cafe-900 hover:bg-cafe-500 shadow-lg shadow-cafe-400/25 focus-visible:ring-cafe-400",
        whatsapp:
          "bg-[#25D366] text-white hover:bg-[#1ea952] shadow-lg shadow-[#25D366]/30 focus-visible:ring-[#25D366]",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
