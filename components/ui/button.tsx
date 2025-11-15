import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive font-medium-heading",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-[#002bff] via-[#0078ff] to-[#0000d4] text-white hover:opacity-90",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-md focus-visible:ring-rose-500/20 dark:focus-visible:ring-rose-500/40 transition-all",
        outline:
          "border border-[#eeeeee] bg-background shadow-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:bg-input/30 dark:border-input dark:hover:bg-blue-950 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors",
        secondary:
          "bg-gradient-to-br from-white to-[#eeeeee] text-secondary-foreground border border-[#eeeeee] hover:opacity-90",
        ghost:
          "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400 transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-12",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
