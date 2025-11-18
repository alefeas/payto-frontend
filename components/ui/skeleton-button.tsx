import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SkeletonButtonProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SkeletonButton({ className = "", size = 'md' }: SkeletonButtonProps) {
  const sizeClasses = {
    sm: 'h-9 w-16',
    md: 'h-12 w-20',
    lg: 'h-12 w-24'
  }

  return <Skeleton className={cn(sizeClasses[size], 'rounded-md', className)} />
}
