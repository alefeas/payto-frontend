import { Card, CardContent } from "@/components/ui/card"
import { colors } from "@/styles"
import { LucideIcon } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  mainValue: string | number
  secondaryValues?: { label: string; value: string | number }[]
  tertiaryValue?: string
  icon: LucideIcon
  isPositive?: boolean
}

export function AnalyticsCard({ 
  title, 
  mainValue, 
  secondaryValues, 
  tertiaryValue,
  icon: Icon,
  isPositive = true
}: AnalyticsCardProps) {
  return (
    <Card className="transition-all duration-300 ease-in-out border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="w-full">
            <p className="text-sm text-gray-500 font-light mb-2">
              {title}
            </p>
            <p className={`text-2xl font-medium-heading text-gray-900 mb-3`}>
              {mainValue}
            </p>
            {secondaryValues && (
              <div className="space-y-1 mb-2">
                {secondaryValues.map((item, idx) => (
                  <p key={idx} className="text-xs text-gray-600 font-medium-heading">
                    {item.label}: {item.value}
                  </p>
                ))}
              </div>
            )}
            {tertiaryValue && (
              <p className="text-xs text-gray-600 font-medium-heading">
                {tertiaryValue}
              </p>
            )}
          </div>
          <Icon className="h-6 w-6 flex-shrink-0 mt-1" style={{ color: colors.accent }} />
        </div>
      </CardContent>
    </Card>
  )
}
