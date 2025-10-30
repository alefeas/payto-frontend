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
  AlertTriangle,
  CheckSquare,
  Activity,
  Shield,
  CheckCircle2,
  XCircle,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FeatureCard } from "@/components/company/feature-card"
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
  const [badges, setBadges] = useState<Record<string, number>>({})
  const [badgesLoading, setBadgesLoading] = useState(true)

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

  const loadBadges = async () => {
    try {
      setBadgesLoading(true)
      const { analyticsService } = await import('@/services/analytics.service')
      const data = await analyticsService.getPendingInvoices(companyId)
      setBadges({
        pending_payments: data.to_pay || 0,
        pending_collections: data.to_collect || 0,
        pending_approvals: data.pending_approvals || 0
      })
    } catch (error) {
      console.error('Error loading badges:', error)
    } finally {
      setBadgesLoading(false)
    }
  }

  const loadCompany = async () => {
    try {
      setLoading(true)
      const companies = await companyService.getCompanies()
      const found = companies.find(c => c.id === companyId)
      setCompany(found || null)
      
      if (found) {
        // Load badges
        loadBadges()
        
        // Try to get certificate details if user has permission
        if (['owner', 'administrator'].includes(found.role || '')) {
          try {
            const cert = await afipCertificateService.getCertificate(companyId)
            setCertificate(cert)
            setIsAfipVerified(cert?.isActive || false)
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

  const userRole = company.role as CompanyRole

  interface MenuItem {
    title: string
    description: string
    icon: any
    badge?: number | string
    permission?: string
    action: () => void
  }

  const allMenuItems: MenuItem[] = [
    ...(hasPermission(userRole, 'invoices.create') ? [{
      title: "Emitir Comprobante",
      description: "Facturas, NC, ND, Recibos, etc.",
      icon: FileText,
      permission: 'invoices.create' as const,
      action: () => router.push(`/company/${company.id}/emit-invoice`)
    }] : []),
    ...(hasPermission(userRole, 'invoices.create') ? [{
      title: "Cargar Factura Recibida",
      description: "Registrar factura de empresa externa",
      icon: Plus,
      permission: 'invoices.create' as const,
      action: () => router.push(`/company/${company.id}/load-invoice`)
    }] : []),
    ...(hasPermission(userRole, 'invoices.view') ? [{
      title: "Ver Facturas",
      description: "Gestionar todas las facturas",
      icon: FileText,
      permission: 'invoices.view' as const,
      action: () => router.push(`/company/${company.id}/invoices`)
    }] : []),
    ...(hasPermission(userRole, 'payments.create') ? [{
      title: "Cuentas por Pagar",
      description: "Gestionar pagos a proveedores",
      icon: CreditCard,
      badge: 'pending_payments',
      permission: 'payments.create' as const,
      action: () => router.push(`/company/${company.id}/accounts-payable`)
    }] : []),
    ...(hasPermission(userRole, 'payments.view') ? [{
      title: "Cuentas por Cobrar",
      description: "Gestionar cobros de clientes",
      icon: Eye,
      badge: 'pending_collections',
      permission: 'payments.view' as const,
      action: () => router.push(`/company/${company.id}/accounts-receivable`)
    }] : []),
    ...(hasPermission(userRole, 'invoices.approve') ? [{
      title: "Aprobar Facturas",
      description: "Revisar facturas de proveedores",
      icon: CheckSquare,
      badge: 'pending_approvals',
      permission: 'invoices.approve' as const,
      action: () => router.push(`/company/${company.id}/approve-invoices`)
    }] : []),
    ...(hasPermission(userRole, 'audit.view') ? [{
      title: "Registro de Auditoría",
      description: "Historial de actividades del sistema",
      icon: Activity,
      permission: 'audit.view' as const,
      action: () => router.push(`/company/${company.id}/audit-log`)
    }] : []),
    {
      title: "Estadísticas",
      description: "Reportes y análisis financiero",
      icon: BarChart3,
      action: () => router.push(`/company/${company.id}/analytics`)
    },
    {
      title: "Libro IVA",
      description: "Registro de operaciones con IVA",
      icon: BookOpen,
      action: () => router.push(`/company/${company.id}/iva-book`)
    }
  ]

  const menuItems = allMenuItems

  const additionalItems = [
    {
      title: "Mis Clientes",
      description: "Gestionar clientes externos",
      icon: Users,
      action: () => router.push(`/company/${company.id}/clients`)
    },
    {
      title: "Mis Proveedores",
      description: "Gestionar proveedores externos",
      icon: Users,
      action: () => router.push(`/company/${company.id}/suppliers`)
    },
    {
      title: "Red Empresarial",
      description: "Conectar con otras empresas",
      icon: Users,
      action: () => router.push(`/company/${company.id}/network`)
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
            <p className="text-muted-foreground">
              Tu rol: {translateRole(company.role || 'operator')} • {translateTaxCondition(company.taxCondition || 'not_specified')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ID de Conexión: <span className="font-mono font-semibold">{company.uniqueId}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {hasPermission(userRole, 'members.view') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/company/${company.id}/members`)}
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
                  onClick={() => router.push(`/company/${company.id}/verify`)}
                  className="border-[#eeeeee] text-foreground hover:bg-accent"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar AFIP
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/company/${company.id}/settings`)}
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

        {/* Banner de Estado de Verificación AFIP - Visible para todos */}
        {isAfipVerified ? (
          <div className="flex items-center gap-3 p-3 bg-white border border-[#eeeeee] rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-[#002bff] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">
                ✓ Cuenta Verificada con AFIP
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Todas las funciones están habilitadas. Podés emitir facturas electrónicas oficiales y consultar datos fiscales automáticamente.
              </p>
            </div>
            {hasPermission(userRole, 'company.view_settings') && (
              <Button 
                size="sm" 
                variant="outline"
                className="border-[#002bff] text-[#002bff] hover:bg-accent flex-shrink-0"
                onClick={() => router.push(`/company/${company.id}/verify`)}
              >
                Ver Detalles
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-white border border-[#eeeeee] rounded-lg">
            <Eye className="h-5 w-5 text-[#002bff] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">🔓 Modo Vista Previa Activo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Podés explorar el sistema y ver cómo funciona cada sección, pero todas las acciones están bloqueadas hasta que verifiques tu cuenta con AFIP.
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                La verificación con AFIP garantiza la seguridad y legalidad de todas las operaciones en el sistema.
              </p>
            </div>
            <Button 
              size="sm" 
              className="flex-shrink-0"
              onClick={() => router.push(`/company/${company.id}/verify`)}
            >
              Verificar Ahora
            </Button>
          </div>
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
              {menuItems.map((item: MenuItem, index) => (
                <FeatureCard
                  key={index}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  onClick={item.action}
                  badge={
                    typeof item.badge === 'string' && !badgesLoading && badges[item.badge] !== undefined
                      ? badges[item.badge]
                      : undefined
                  }
                />
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
                <FeatureCard
                  key={index}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  onClick={item.action}
                  size="small"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
