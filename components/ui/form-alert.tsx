import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormAlertProps {
  type?: "error" | "success" | "warning" | "info"
  title?: string
  message: string
  className?: string
}

export function FormAlert({ type = "error", title, message, className }: FormAlertProps) {
  const styles = {
    error: {
      container: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-900 dark:text-red-100",
      message: "text-red-800 dark:text-red-200",
      Icon: AlertCircle
    },
    success: {
      container: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-900 dark:text-green-100",
      message: "text-green-800 dark:text-green-200",
      Icon: CheckCircle
    },
    warning: {
      container: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
      icon: "text-amber-600 dark:text-amber-400",
      title: "text-amber-900 dark:text-amber-100",
      message: "text-amber-800 dark:text-amber-200",
      Icon: AlertTriangle
    },
    info: {
      container: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-100",
      message: "text-blue-800 dark:text-blue-200",
      Icon: Info
    }
  }

  const style = styles[type]
  const Icon = style.Icon

  return (
    <div className={cn("border rounded-lg p-4", style.container, className)}>
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", style.icon)} />
        <div className="flex-1">
          {title && <p className={cn("font-semibold text-sm mb-1", style.title)}>{title}</p>}
          <p className={cn("text-sm", style.message)}>{message}</p>
        </div>
      </div>
    </div>
  )
}
