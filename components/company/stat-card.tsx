import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { colors } from "@/styles"

interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: LucideIcon
  secondaryValue?: string
  tertiaryValue?: string
}

export function StatCard({ title, value, description, icon: Icon, secondaryValue, tertiaryValue }: StatCardProps) {
  return (
    <Card className="shadow-sm border border-gray-200 relative overflow-hidden">
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col flex-1">
            <CardDescription className="text-xs text-gray-500 font-light">{title}</CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 mt-2">
              {value}
            </CardTitle>
          </div>
          <div style={{ color: colors.accent }}>
            <Icon className="h-6 w-6 flex-shrink-0" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex flex-col h-full space-y-3">
          {(secondaryValue || tertiaryValue) && (
            <div className="space-y-2 pb-2 border-b border-gray-100">
              {secondaryValue && (
                <div className="text-sm text-gray-600 font-light">
                  {secondaryValue}
                </div>
              )}
              {tertiaryValue && (
                <div className="text-sm text-gray-600 font-light">
                  {tertiaryValue}
                </div>
              )}
            </div>
          )}
          <div className="text-xs font-light text-gray-500">
            {description}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
