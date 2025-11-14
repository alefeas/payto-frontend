import { Building2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { parseDateLocal } from "@/lib/utils"
import type { CompanyConnection } from "@/types/network"

interface ConnectionCardProps {
  connection: CompanyConnection
  onDelete: (connection: CompanyConnection) => void
}

export function ConnectionCard({ connection, onDelete }: ConnectionCardProps) {
  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      {/* Desktop (lg+) - Layout horizontal completo */}
      <div className="hidden lg:flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{connection.connectedCompanyName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">ID:</span>
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">{connection.connectedCompanyUniqueId}</code>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(connection.connectedCompanyUniqueId)
                  toast.success('ID copiado')
                }}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {parseDateLocal(connection.connectedAt)?.toLocaleDateString('es-AR')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{connection.totalInvoicesSent}</p>
              <p className="text-xs text-muted-foreground">Enviadas</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-900">{connection.totalInvoicesReceived}</p>
              <p className="text-xs text-muted-foreground">Recibidas</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onDelete(connection)}
            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tablet (sm-lg) - Layout compacto horizontal */}
      <div className="hidden sm:flex lg:hidden items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{connection.connectedCompanyName}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground">ID:</span>
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">{connection.connectedCompanyUniqueId}</code>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(connection.connectedCompanyUniqueId)
                  toast.success('ID copiado')
                }}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {parseDateLocal(connection.connectedAt)?.toLocaleDateString('es-AR')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{connection.totalInvoicesSent}</p>
              <p className="text-xs text-muted-foreground">Env.</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{connection.totalInvoicesReceived}</p>
              <p className="text-xs text-muted-foreground">Rec.</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onDelete(connection)}
            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Mobile - Layout vertical */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm truncate">{connection.connectedCompanyName}</h3>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onDelete(connection)}
            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">ID:</span>
            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">{connection.connectedCompanyUniqueId}</code>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(connection.connectedCompanyUniqueId)
                toast.success('ID copiado')
              }}
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Conectado el {parseDateLocal(connection.connectedAt)?.toLocaleDateString('es-AR')}
          </p>
        </div>
      </div>
    </Card>
  )
}
