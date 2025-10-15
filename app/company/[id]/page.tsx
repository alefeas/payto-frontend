"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
  ArrowLeft, 
  FileText, 
  Eye, 
  CreditCard, 
  BarChart3, 
  Plus,
  Users,
  Settings,
  Calendar,
  AlertTriangle,
  CheckSquare,
  Activity,
  Shield,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { companyService, Company } from "@/services/company.service"
import { afipCertificateService } from "@/services/afip-certificate.service"
import { toast } from "sonner"
import { CompanyRole } from "@/types"
import { translateRole } from "@/lib/role-utils"
import { translateTaxCondition } from "@/lib/tax-condition-utils"
import { hasPermission } from "@/lib/permissions"

export default function CompanyPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAfipVerified, setIsAfipVerified] = useState(false)
  const [certificate, setCertificate] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated && companyId) {
      loadCompany()
    }
  }, [isAuthenticated, companyId])

  const loadCompany = async () => {
    try {
      setLoading(true)
      const companies = await companyService.getCompanies()
      const found = companies.find(c => c.id === companyId)
      setCompany(found || null)
      
      if (found) {
        // Try to get certificate details if user has permission
        if (['owner', 'administrator'].includes(found.role || '')) {
          try {
            const cert = await afipCertificateService.getCertificate(companyId)
            setCertificate(cert)
            setIsAfipVerified(cert.isActive)
          } catch {
            setIsAfipVerified(false)
            setCertificate(null)
          }
        } else {
          // For non-admin users, check verification status from company data
          setIsAfipVerified(found.verificationStatus === 'verified' || found.verification_status === 'verified')
        }
      }
    } catch (error: any) {
      toast.error('Error al cargar perfil fiscal')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) return null
  if (!company) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Perfil Fiscal no encontrado</h1>
          <Button onClick={() => router.push('/dashboard')}>Volver al Dashboard</Button>
        </div>
      </div>
    )
  }

  const canIssueInvoices = company.taxCondition !== 'final_consumer'
  const userRole = company.role as CompanyRole

  const allMenuItems = [
    ...(canIssueInvoices && hasPermission(userRole, 'invoices.create') ? [{
      title: "Emitir Factura",
      description: "Crear nueva factura para clientes",
      icon: FileText,
      color: "bg-blue-500",
      permission: 'invoices.create' as const,
      action: () => router.push(`/company/${company?.id}/emit-invoice`)
    }] : []),
    ...(hasPermission(userRole, 'invoices.create') ? [{
      title: "Cargar Factura Recibida",
      description: "Registrar factura de empresa externa",
      icon: Plus,
      color: "bg-teal-500",
      permission: 'invoices.create' as const,
      action: () => router.push(`/company/${company?.id}/load-invoice`)
    }] : []),
    ...(hasPermission(userRole, 'invoices.view') ? [{
      title: "Ver Facturas",
      description: "Gestionar todas las facturas",
      icon: FileText,
      color: "bg-purple-500",
      permission: 'invoices.view' as const,
      action: () => router.push(`/company/${company?.id}/invoices`)
    }] : []),
    ...(hasPermission(userRole, 'payments.create') ? [{
      title: "Pagar Facturas",
      description: "Gestionar pagos a proveedores",
      icon: CreditCard,
      color: "bg-orange-500",
      badge: 0,
      permission: 'payments.create' as const,
      action: () => router.push(`/company/${company?.id}/payments`)
    }] : []),
    ...(canIssueInvoices && hasPermission(userRole, 'payments.view') ? [{
      title: "Cobrar Facturas",
      description: "Gestionar cobros de clientes",
      icon: Eye,
      color: "bg-yellow-500",
      badge: 0,
      permission: 'payments.view' as const,
      action: () => router.push(`/company/${company?.id}/collections`)
    }] : []),
    ...(canIssueInvoices && hasPermission(userRole, 'invoices.approve') ? [{
      title: "Aprobar Facturas",
      description: "Revisar facturas de proveedores",
      icon: CheckSquare,
      color: "bg-green-500",
      badge: 0,
      permission: 'invoices.approve' as const,
      action: () => router.push(`/company/${company?.id}/approve-invoices`)
    }] : []),
    ...(canIssueInvoices && hasPermission(userRole, 'invoices.view') ? [{
      title: "Facturas Rechazadas",
      description: "Gestionar facturas que requieren atención",
      icon: AlertTriangle,
      color: "bg-red-500",
      badge: 0,
      permission: 'invoices.view' as const,
      action: () => router.push(`/company/${company?.id}/rejected-invoices`)
    }] : []),
    ...(hasPermission(userRole, 'audit.view') ? [{
      title: "Registro de Auditoría",
      description: "Historial de actividades del sistema",
      icon: Activity,
      color: "bg-gray-600",
      permission: 'audit.view' as const,
      action: () => router.push(`/company/${company?.id}/audit-log`)
    }] : []),
    {
      title: "Estadísticas",
      description: "Reportes y análisis financiero",
      icon: BarChart3,
      color: "bg-indigo-500",
      action: () => router.push(`/company/${company?.id}/analytics`)
    },
    {
      title: "Vencimientos",
      description: "Control de fechas y cobros pendientes",
      icon: Calendar,
      color: "bg-pink-500",
      action: () => router.push(`/company/${company?.id}/due-invoices`)
    }
  ]

  const menuItems = allMenuItems

  const additionalItems = [
    {
      title: "Mis Clientes",
      description: "Gestionar clientes externos",
      icon: Users,
      color: "bg-blue-500",
      action: () => router.push(`/company/${company?.id}/clients`)
    },
    {
      title: "Mis Proveedores",
      description: "Gestionar proveedores externos",
      icon: Users,
      color: "bg-teal-500",
      action: () => router.push(`/company/${company?.id}/suppliers`)
    },
    {
      title: "Red Empresarial",
      description: "Conectar con otras empresas",
      icon: Users,
      color: "bg-pink-500",
      action: () => router.push(`/company/${company?.id}/network`)
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">Tu rol: {translateRole(company.role || 'operator')} • {translateTaxCondition(company.taxCondition)}</p>
          </div>
          <div className="flex gap-2">
            {hasPermission(userRole, 'members.view') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/company/${company?.id}/members`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Miembros
              </Button>
            )}
            {hasPermission(userRole, 'company.view_settings') && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/company/${company?.id}/verify`)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar AFIP
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/company/${company?.id}/settings`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Facturas</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos Mensuales</p>
                  <p className="text-2xl font-bold text-green-600">$0</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="text-2xl font-bold">{company.isActive ? 'Activo' : 'Inactivo'}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Banner de Estado de Verificación AFIP - Solo para admin */}
        {hasPermission(userRole, 'company.view_settings') && (
          isAfipVerified ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-green-900 text-sm">
                  Verificado {certificate?.isSelfSigned ? '(Autofirmado)' : 'con AFIP'} - {certificate?.environment === 'production' ? 'Producción' : 'Testing'}
                </p>
                <p className="text-xs text-green-800 mt-0.5">
                  {certificate?.isSelfSigned 
                    ? 'Solo para desarrollo. No podrás facturar con AFIP.' 
                    : certificate?.environment === 'production'
                      ? 'Facturas legalmente válidas habilitadas.'
                      : 'Ambiente de prueba. Facturas sin validez legal.'}
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-100 flex-shrink-0"
                onClick={() => router.push(`/company/${company?.id}/verify`)}
              >
                Ver Detalles
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <XCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-orange-900 text-sm">Sin Verificar AFIP</p>
                <p className="text-xs text-orange-800 mt-0.5">
                  No podrás usar facturación electrónica ni consultar datos automáticos de clientes/proveedores.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-orange-600 text-orange-700 hover:bg-orange-100 flex-shrink-0"
                onClick={() => router.push(`/company/${company?.id}/verify`)}
              >
                Verificar
              </Button>
            </div>
          )
        )}

        {/* Alerta para Consumidor Final */}
        {!canIssueInvoices && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Cuenta de Solo Recepción</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    Como Consumidor Final, no podés emitir facturas. Podés recibir facturas, ver historial y declarar pagos. 
                    Si querés emitir facturas, actualizá tu perfil a Monotributo o Responsable Inscripto en Configuración.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Facturas</CardTitle>
            <CardDescription>
              Selecciona una opción para gestionar las facturas de {company.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {menuItems.map((item, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={item.action}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${item.color}`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.badge !== undefined && item.badge > 0 && (
                            <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                              {item.badge}
                            </div>
                          )}
                        </div>
                        {item.badge !== undefined && item.badge === 0 && (
                          <div className="text-xs text-green-600 font-medium mb-1">
                            ✓ Todo al día
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Features */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Adicionales</CardTitle>
            <CardDescription>
              Herramientas avanzadas para optimizar tu gestión empresarial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {additionalItems.map((item, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={item.action}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        <item.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
