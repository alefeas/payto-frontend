import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-gray-400 selection:bg-blue-500 selection:text-white dark:bg-input/30 min-h-16 w-full rounded-md border border-[#eeeeee] bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 hover:bg-blue-50 hover:border-blue-200",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
