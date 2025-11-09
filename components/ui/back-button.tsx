import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  href?: string
  onClick?: () => void
  className?: string
}

export function BackButton({ href, onClick, className }: BackButtonProps) {
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

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={`group ${className || ''}`}
    >
      <ArrowLeft className="h-4 w-4 text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
      Volver
    </Button>
  )
}
