import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  href?: string
  onClick?: () => void
}

export function BackButton({ href, onClick }: BackButtonProps) {
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
      className="group"
    >
      <ArrowLeft className="h-4 w-4 text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
      Volver
    </Button>
  )
}
