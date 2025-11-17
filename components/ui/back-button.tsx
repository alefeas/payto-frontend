import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  href?: string
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function BackButton({ href, onClick, className, size = 'md' }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  // Size variants: sm (icon only 48x48), md (icon only 48x48 mobile, icon+text 102x48 sm+), lg (full width)
  const sizeClasses = {
    sm: 'h-12 w-12 px-0',
    md: 'h-12 w-12 px-0 sm:w-[102px] sm:px-2',
    lg: 'w-full h-12'
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={`group back-button-${size} ${sizeClasses[size]} ${className || ''}`}
    >
      <ArrowLeft className="h-4 w-4 text-blue-600 group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
      <span className="hidden sm:inline text-sm font-medium">Volver</span>
    </Button>
  )
}
