import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { colors } from "@/styles/colors"

interface ActionItemProps {
  title: string
  description: string
  icon: LucideIcon
  onClick: () => void
  className?: string
}

export function ActionItem({
  title,
  description,
  icon: Icon,
  onClick,
  className,
}: ActionItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 sm:p-5 rounded-lg border border-[var(--color-gray)] bg-white cursor-pointer action-item shadow-xs",
        className
      )}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 font-light">{description}</p>
      </div>
      <div className="p-2 rounded-lg flex-shrink-0 ml-3" style={{ backgroundColor: `${colors.accent}15` }}>
        <Icon className="h-4 w-4" style={{ color: colors.accent }} />
      </div>
    </div>
  )
}
