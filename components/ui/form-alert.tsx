import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { colors } from "@/styles"

interface FormAlertProps {
  type?: "error" | "success" | "warning" | "info"
  title?: string
  message: string
  className?: string
}

export function FormAlert({ type = "error", title, message, className }: FormAlertProps) {
  const styles = {
    error: {
      container: "bg-white border-gray-200",
      iconColor: "#dc2626",
      titleColor: "#991b1b",
      message: "text-muted-foreground",
      Icon: AlertCircle
    },
    success: {
      container: "bg-white border-gray-200",
      iconColor: colors.accent,
      titleColor: colors.accent,
      message: "text-muted-foreground",
      Icon: CheckCircle
    },
    warning: {
      container: "bg-white border-gray-200",
      iconColor: "#b45309",
      titleColor: "#92400e",
      message: "text-muted-foreground",
      Icon: AlertTriangle
    },
    info: {
      container: "bg-white border-gray-200",
      iconColor: colors.accent,
      titleColor: colors.accent,
      message: "text-muted-foreground",
      Icon: Info
    }
  }

  const style = styles[type]
  const Icon = style.Icon

  return (
    <div className={cn("border rounded-lg p-4", style.container, className)}>
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5")} style={{ color: style.iconColor }} />
        <div className="flex-1">
          {title && <p className={cn("font-semibold text-sm mb-1")} style={{ color: style.titleColor }}>{title}</p>}
          <p className={cn("text-sm", style.message)}>{message}</p>
        </div>
      </div>
    </div>
  )
}
