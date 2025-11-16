import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-gray-400 selection:bg-blue-500 selection:text-white dark:bg-input/30 h-12 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 font-light hover:bg-blue-50 hover:border-blue-200",
        "border-[var(--color-gray)]",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
