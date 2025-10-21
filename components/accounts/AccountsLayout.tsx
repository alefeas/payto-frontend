"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AccountsLayoutProps {
  companyId: string
  title: string
  subtitle: string
  headerActions?: ReactNode
  summaryCards: ReactNode
  filters: {
    search: string
    from_date: string
    to_date: string
  }
  onFiltersChange: (filters: any) => void
  activeTab: string
  onTabChange: (tab: string) => void
  tabs: Array<{ value: string; label: string; content: ReactNode }>
}

export function AccountsLayout({
  companyId,
  title,
  subtitle,
  headerActions,
  summaryCards,
  filters,
  onFiltersChange,
  activeTab,
  onTabChange,
  tabs,
}: AccountsLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {headerActions && <div className="flex gap-2">{headerActions}</div>}
        </div>

        {summaryCards}

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.from_date}
                onChange={(e) => onFiltersChange({ ...filters, from_date: e.target.value })}
                className="w-40"
                placeholder="Desde"
              />
              <Input
                type="date"
                value={filters.to_date}
                onChange={(e) => onFiltersChange({ ...filters, to_date: e.target.value })}
                className="w-40"
                placeholder="Hasta"
              />
              <Input
                placeholder="Buscar por CUIT (XX-XXXXXXXX-X)..."
                value={filters.search}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, '')
                  if (value.length > 11) value = value.slice(0, 11)
                  if (value.length > 2) value = value.slice(0, 2) + '-' + value.slice(2)
                  if (value.length > 11) value = value.slice(0, 11) + '-' + value.slice(11)
                  onFiltersChange({ ...filters, search: value })
                }}
                maxLength={13}
                className="flex-1"
              />
              {(filters.from_date || filters.to_date || filters.search) && (
                <Button
                  variant="outline"
                  onClick={() => onFiltersChange({ ...filters, from_date: '', to_date: '', search: '' })}
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
