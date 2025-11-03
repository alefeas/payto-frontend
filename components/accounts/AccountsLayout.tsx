"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
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
  searchPlaceholder?: string
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
  searchPlaceholder = 'Buscar por número de factura o CUIT...'
}: AccountsLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href={`/company/${companyId}`} className="border-0" />
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {headerActions && <div className="flex gap-2">{headerActions}</div>}
        </div>

        {summaryCards}

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
            placeholder={searchPlaceholder}
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="flex-1"
          />
          {(filters.from_date || filters.to_date || filters.search) && (
            <Button
              variant="outline"
              onClick={() => onFiltersChange({ ...filters, from_date: '', to_date: '', search: '' })}
            >
              Limpiar
            </Button>
          )}
        </div>

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
