import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface InfoMessageProps {
  icon: LucideIcon
  iconColor?: string
  title?: string
  description?: string | ReactNode
  children?: ReactNode
  className?: string
  variant?: 'info' | 'success' | 'warning' | 'error'
}

const variantStyles = {
  info: 'bg-white border-gray-200',
  success: 'bg-white border-gray-200',
  warning: 'bg-white border-gray-200',
  error: 'bg-white border-gray-200',
}

const iconColors = {
  info: '#3b82f6', // blue-500
  success: '#16a34a', // green-600
  warning: '#f59e0b', // amber-500
  error: '#dc2626', // red-600
}

const titleColors = {
  info: 'text-blue-700',
  success: 'text-green-700',
  warning: 'text-amber-700',
  error: 'text-red-700',
}

export function InfoMessage({ 
  icon: Icon, 
  iconColor,
  title, 
  description, 
  children,
  className,
  variant = 'info'
}: InfoMessageProps) {
  const finalIconColor = iconColor || iconColors[variant]
  const hasTitle = title || children
  
  return (
    <div className={cn(
      "flex gap-3 p-3 sm:p-4 rounded-lg border",
      hasTitle ? "items-start" : "items-center",
      variantStyles[variant],
      className
    )}>
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" style={{ color: finalIconColor }} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm sm:text-base text-gray-900">{title}</p>}
        {description && (
          <div className="text-xs sm:text-sm text-gray-600 mt-1">
            {description}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
