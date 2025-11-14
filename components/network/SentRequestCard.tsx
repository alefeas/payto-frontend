import { Building2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { parseDateLocal } from "@/lib/utils"
import type { ConnectionRequest } from "@/types/network"

interface SentRequestCardProps {
  request: ConnectionRequest
}

export function SentRequestCard({ request }: SentRequestCardProps) {
  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{request.toCompanyName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">ID:</span>
              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">{request.fromCompanyUniqueId}</code>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(request.fromCompanyUniqueId)
                  toast.success('ID copiado')
                }}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {parseDateLocal(request.requestedAt)?.toLocaleDateString('es-AR')}
              </span>
            </div>
            {request.message && (
              <p className="text-xs mt-1.5 p-1.5 bg-gray-50 rounded text-gray-700 break-words italic">
                &ldquo;{request.message}&rdquo;
              </p>
            )}
          </div>
        </div>
        
        <Badge variant="outline" className="text-yellow-600 border-yellow-600 flex-shrink-0 h-7">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm truncate">{request.toCompanyName}</h3>
          </div>
          <Badge variant="outline" className="text-yellow-600 border-yellow-600 flex-shrink-0 text-xs h-6">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">ID:</span>
            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">{request.fromCompanyUniqueId}</code>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(request.fromCompanyUniqueId)
                toast.success('ID copiado')
              }}
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Enviado el {parseDateLocal(request.requestedAt)?.toLocaleDateString('es-AR')}
          </p>
          
          {request.message && (
            <p className="text-xs p-1.5 bg-gray-50 rounded text-gray-700 break-words italic">
              &ldquo;{request.message}&rdquo;
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
