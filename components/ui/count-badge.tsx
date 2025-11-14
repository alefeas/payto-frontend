import { cn } from "@/lib/utils"

interface CountBadgeProps {
  count: number
  className?: string
}

export function CountBadge({ count, className }: CountBadgeProps) {
  return (
    <span className={cn("text-xs sm:text-sm text-gray-500 shrink-0", className)}>
      ({count})
    </span>
  )
}
