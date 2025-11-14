import { Building2, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { parseDateLocal } from "@/lib/utils"
import type { ConnectionRequest } from "@/types/network"

interface ReceivedRequestCardProps {
  request: ConnectionRequest
  onAccept: (request: ConnectionRequest) => void
  onReject: (request: ConnectionRequest) => void
  isAccepting: boolean
  isRejecting: boolean
}

export function ReceivedRequestCard({ 
  request, 
  onAccept, 
  onReject, 
  isAccepting, 
  isRejecting 
}: ReceivedRequestCardProps) {
  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{request.fromCompanyName}</h3>
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
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => onAccept(request)}
            disabled={isAccepting || isRejecting}
            className="h-8"
          >
            {isAccepting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                Aceptando...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Aceptar
              </>
            )}
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onReject(request)}
            disabled={isAccepting || isRejecting}
            className="h-8"
          >
            {isRejecting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                Rechazando...
              </>
            ) : (
              <>
                <X className="h-3.5 w-3.5 mr-1" />
                Rechazar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-sm truncate flex-1">{request.fromCompanyName}</h3>
        </div>
        
        <div className="space-y-1.5">
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
            Solicitado el {parseDateLocal(request.requestedAt)?.toLocaleDateString('es-AR')}
          </p>
          
          {request.message && (
            <p className="text-xs p-1.5 bg-gray-50 rounded text-gray-700 break-words italic">
              &ldquo;{request.message}&rdquo;
            </p>
          )}
          
          <div className="flex gap-2 pt-1">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => onAccept(request)}
              disabled={isAccepting || isRejecting}
              className="flex-1 h-8"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Aceptando...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Aceptar
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onReject(request)}
              disabled={isAccepting || isRejecting}
              className="flex-1 h-8"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Rechazar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
