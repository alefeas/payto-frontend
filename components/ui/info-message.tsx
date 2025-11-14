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
  info: 'bg-blue-50/50 border-blue-100',
  success: 'bg-green-50/50 border-green-100',
  warning: 'bg-amber-50/50 border-amber-100',
  error: 'bg-red-50/50 border-red-100',
}

const iconColors = {
  info: '#3b82f6', // blue-500
  success: '#16a34a', // green-600
  warning: '#f59e0b', // amber-500
  error: '#dc2626', // red-600
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
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 sm:p-4 rounded-lg border",
      variantStyles[variant],
      className
    )}>
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" style={{ color: finalIconColor }} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-sm sm:text-base text-gray-900">{title}</p>}
        {description && (
          <div className="text-xs sm:text-sm text-gray-900 mt-1">
            {description}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
