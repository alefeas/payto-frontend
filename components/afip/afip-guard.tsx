'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { useAfipCertificate } from '@/hooks/use-afip-certificate'
// Componente de alerta inline para evitar dependencias circulares
function AfipCertificateAlert({
  companyId,
  title = "Certificado AFIP requerido",
  description = "Esta funcionalidad requiere un certificado AFIP activo para funcionar correctamente.",
  variant = 'error',
  showButton = true,
  className = ""
}: {
  companyId: string
  title?: string
  description?: string
  variant?: 'error' | 'warning'
  showButton?: boolean
  className?: string
}) {
  const router = useRouter()
  
  const isError = variant === 'error'
  const bgColor = isError ? 'bg-red-50' : 'bg-amber-50'
  const borderColor = isError ? 'border-red-200' : 'border-amber-200'
  const iconColor = isError ? 'text-red-600' : 'text-amber-600'
  const titleColor = isError ? 'text-red-900' : 'text-amber-900'
  const descColor = isError ? 'text-red-700' : 'text-amber-700'
  
  const Icon = isError ? Shield : AlertTriangle

  return (
    <div className={`flex items-start gap-3 p-4 ${bgColor} border ${borderColor} rounded-lg ${className}`}>
      <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${titleColor} text-sm`}>{title}</p>
        <p className={`text-xs ${descColor} mt-1`}>{description}</p>
        {showButton && (
          <Button 
            onClick={() => router.push(`/company/${companyId}/verify`)}
            size="sm"
            className="mt-3"
          >
            Configurar Certificado
          </Button>
        )}
      </div>
    </div>
  )
}
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AfipGuardProps {
  companyId: string
  children: ReactNode
  fallback?: ReactNode
  showAlert?: boolean
  alertTitle?: string
  alertDescription?: string
  alertVariant?: 'error' | 'warning'
  blockInteraction?: boolean
  onBlocked?: () => void
  className?: string
}

/**
 * Componente que protege funcionalidades que requieren certificado AFIP activo
 * Bloquea la interacción y muestra alertas cuando no hay certificado válido
 */
export function AfipGuard({
  companyId,
  children,
  fallback,
  showAlert = true,
  alertTitle = "Certificado AFIP requerido",
  alertDescription = "Esta funcionalidad requiere un certificado AFIP activo para funcionar correctamente.",
  alertVariant = 'error',
  blockInteraction = true,
  onBlocked,
  className = ""
}: AfipGuardProps) {
  const { isVerified, isLoading } = useAfipCertificate(companyId)

  // Si está cargando, no mostrar alerta aún
  if (isLoading) {
    return <>{children}</>
  }

  // Si no está verificado y hay fallback personalizado
  if (!isVerified && fallback) {
    return <>{fallback}</>
  }

  // Si no está verificado y debe bloquear interacción
  if (!isVerified && blockInteraction) {
    return (
      <div className={className}>
        {showAlert && (
          <AfipCertificateAlert
            companyId={companyId}
            title={alertTitle}
            description={alertDescription}
            variant={alertVariant}
            className="mb-4"
          />
        )}
        <div 
          className="relative"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onBlocked?.()
            toast.error(alertTitle, {
              description: alertDescription
            })
          }}
        >
          <div className="pointer-events-none opacity-50">
            {children}
          </div>
          <div className="absolute inset-0 cursor-not-allowed" />
        </div>
      </div>
    )
  }

  // Si está verificado o no debe bloquear, mostrar contenido normal
  return <>{children}</>
}

/**
 * Hook para validar certificado AFIP antes de ejecutar acciones
 */
export function useAfipGuard(companyId: string) {
  const { isVerified, isLoading } = useAfipCertificate(companyId)

  const validateAndExecute = (
    action: () => void | Promise<void>,
    errorMessage = "Certificado AFIP requerido para esta acción"
  ) => {
    if (isLoading) return

    if (!isVerified) {
      toast.error("Certificado AFIP requerido", {
        description: errorMessage
      })
      return
    }

    return action()
  }

  return {
    isVerified,
    isLoading,
    validateAndExecute
  }
}

/**
 * Componente para botones que requieren certificado AFIP
 */
interface AfipButtonProps {
  companyId: string
  onClick: () => void | Promise<void>
  children: ReactNode
  errorMessage?: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  loadingText?: string
}

export function AfipButton({
  companyId,
  onClick,
  children,
  errorMessage = "Certificado AFIP requerido para esta acción",
  className,
  variant = "default",
  size = "default",
  disabled = false,
  loadingText = "Validando..."
}: AfipButtonProps) {
  const { validateAndExecute, isVerified, isLoading } = useAfipGuard(companyId)

  const handleClick = () => {
    validateAndExecute(onClick, errorMessage)
  }

  const isButtonDisabled = disabled || isLoading || (!isLoading && !isVerified)
  const buttonTitle = isLoading 
    ? "Validando certificado AFIP..." 
    : !isVerified 
      ? "Requiere certificado AFIP activo" 
      : undefined

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant={variant}
      size={size}
      disabled={isButtonDisabled}
      title={buttonTitle}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}