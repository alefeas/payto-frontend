import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

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
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardDescription className="text-sm text-gray-500 font-light">{title}</CardDescription>
        <CardTitle className="text-2xl font-medium-heading text-gray-900">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-full">
          <div className="space-y-1 flex-1">
            {secondaryValue && (
              <div className="text-sm text-gray-600 font-medium-heading">
                {secondaryValue}
              </div>
            )}
            {tertiaryValue && (
              <div className="text-sm text-gray-600 font-medium-heading">
                {tertiaryValue}
              </div>
            )}
          </div>
          <div className="flex items-center text-sm font-light text-gray-600 mt-2">
            <Icon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
