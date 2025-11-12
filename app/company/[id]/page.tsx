"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { 
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
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { companyService, Company } from "@/services/company.service"
import { afipCertificateService } from "@/services/afip-certificate.service"
import { toast } from "sonner"
import { CompanyRole } from "@/types"
import { translateRole } from "@/lib/role-utils"
import { translateTaxCondition } from "@/lib/tax-condition-utils"
import { hasPermission } from "@/lib/permissions"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardCardsSkeleton } from "@/components/accounts/InvoiceListSkeleton"

export default function CompanyPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAfipVerified, setIsAfipVerified] = useState(false)
  const [certificate, setCertificate] = useState<any>(null)
  const [stats, setStats] = useState({ pendingApproval: 0, receivable: 0, payable: 0, overdue: 0 })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
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
        if (['owner', 'administrator'].includes(String(found.role || ''))) {
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
          setIsAfipVerified(found.verification_status === 'verified')
        }
        
        // Load invoice stats
        try {
          const { invoiceService } = await import('@/services/invoice.service')
          
          // Fetch all invoices across all pages
          let allInvoices: any[] = []
          let page = 1
          let hasMore = true
          
          while (hasMore) {
            const response = await invoiceService.getInvoices(companyId, page)
            const pageData = response.data || []
            if (Array.isArray(pageData) && pageData.length > 0) {
              allInvoices = [...allInvoices, ...pageData]
              page++
            } else {
              hasMore = false
            }
          }
          
          const data = allInvoices
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          // Pendientes de Aprobar: solo facturas normales y ND/NC no asociadas con estado pending_approval
          const pendingApproval = data.filter((inv: any) => {
            const status = inv.display_status || inv.status
            if (status !== 'pending_approval') return false
            
            const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
            const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
            
            // Si es factura normal, incluir
            if (!isCreditNote && !isDebitNote) return true
            
            // Si es ND/NC, solo incluir si NO está asociada a una factura
            if (isCreditNote || isDebitNote) {
              return !(inv as any).related_invoice_id
            }
            
            return false
          }).length
          
          // Por Cobrar: facturas emitidas por esta empresa que no están pagadas/cobradas
          const receivable = data.filter((inv: any) => {
            if (String(inv.issuer_company_id) !== String(companyId)) return false
            if (inv.supplier_id) return false
            const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
            const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
            if (isCreditNote || isDebitNote) return false
            
            const status = inv.display_status || inv.status
            const companyStatus = inv.company_statuses?.[companyId]
            
            // Excluir anuladas
            if (status === 'cancelled' || inv.payment_status === 'cancelled') return false
            // Excluir cobradas completamente
            if (companyStatus === 'collected' || status === 'collected' || inv.payment_status === 'collected' || inv.payment_status === 'paid') return false
            // Excluir rechazadas
            if (status === 'rejected') return false
            
            return true
          }).length
          
          // Por Pagar: facturas recibidas de proveedores que no están pagadas
          const payable = data.filter((inv: any) => {
            // Debe ser emitida por otra empresa (proveedor)
            if (String(inv.issuer_company_id) === String(companyId)) return false
            
            // Excluir ND/NC
            const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
            const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
            if (isCreditNote || isDebitNote) return false
            
            const status = inv.display_status || inv.status
            const companyStatus = inv.company_statuses?.[companyId]
            
            // Excluir anuladas
            if (status === 'cancelled' || inv.payment_status === 'cancelled') return false
            // Excluir pagadas completamente
            if (companyStatus === 'paid' || status === 'paid' || inv.payment_status === 'paid' || inv.payment_status === 'collected') return false
            // Excluir rechazadas
            if (status === 'rejected') return false
            
            return true
          }).length
          
          // Vencidas: facturas con fecha de vencimiento pasada que no están pagadas/cobradas/anuladas/rechazadas
          const overdue = data.filter((inv: any) => {
            if (!inv.due_date) return false
            
            const dueDate = new Date(inv.due_date)
            dueDate.setHours(0, 0, 0, 0)
            if (dueDate >= today) return false
            
            // Excluir TODAS las NC/ND (no se pueden cobrar/pagar en el sistema)
            const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
            const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
            if (isCreditNote || isDebitNote) return false
            
            const status = inv.display_status || inv.status
            const companyStatus = inv.company_statuses?.[companyId]
            const isIssuer = String(inv.issuer_company_id) === String(companyId)
            
            // Excluir anuladas
            if (status === 'cancelled' || inv.payment_status === 'cancelled') return false
            // Excluir rechazadas
            if (status === 'rejected') return false
            // Excluir pagadas/cobradas
            if (isIssuer) {
              if (companyStatus === 'collected' || status === 'collected' || inv.payment_status === 'collected' || inv.payment_status === 'paid') return false
            } else {
              if (companyStatus === 'paid' || status === 'paid' || inv.payment_status === 'paid' || inv.payment_status === 'collected') return false
            }
            
            return true
          }).length
          
          setStats({
            pendingApproval,
            receivable,
            payable,
            overdue
          })
        } catch {
          // Keep default stats
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
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          
          {/* Company Info Card Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </CardHeader>
          </Card>
          
          {/* Menu Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Stats Cards Skeleton */}
          <DashboardCardsSkeleton />
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
    permission?: string
    action: () => void
  }

  const allMenuItems: MenuItem[] = [
    ...(hasPermission(userRole, 'invoices.create') ? [{
      title: "Emitir Comprobante",
      description: "Facturas, NC, ND, Recibos, etc.",
      icon: FileText,
      permission: 'invoices.create' as const,
      action: () => router.push(`/company/${String(company.id)}/emit-invoice`)
    }] : []),
    ...(hasPermission(userRole, 'invoices.create') ? [{
      title: "Cargar Comprobante Manual",
      description: "Registrar comprobantes históricos",
      icon: Plus,
      permission: 'invoices.create' as const,
      action: () => router.push(`/company/${company.id}/load-invoice`)
    }] : []),
    ...(hasPermission(userRole, 'invoices.view') ? [{
      title: "Ver Comprobantes",
      description: "Gestionar todos los comprobantes",
      icon: FileText,
      permission: 'invoices.view' as const,
      action: () => router.push(`/company/${company.id}/invoices`)
    }] : []),
    ...(hasPermission(userRole, 'payments.create') ? [{
      title: "Cuentas por Pagar",
      description: "Gestionar pagos a proveedores",
      icon: CreditCard,
      permission: 'payments.create' as const,
      action: () => router.push(`/company/${company.id}/accounts-payable`)
    }] : []),
    ...(hasPermission(userRole, 'payments.view') ? [{
      title: "Cuentas por Cobrar",
      description: "Gestionar cobros de clientes",
      icon: Eye,
      permission: 'payments.view' as const,
      action: () => router.push(`/company/${company.id}/accounts-receivable`)
    }] : []),
    ...(hasPermission(userRole, 'invoices.approve') ? [{
      title: "Aprobar Comprobantes",
      description: "Revisar comprobantes de proveedores",
      icon: CheckSquare,
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">
              Tu rol: {translateRole(company.role || 'operator')} • {translateTaxCondition(company.taxCondition || 'not_specified')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ID de Conexión: <span className="font-mono font-semibold">{company.uniqueId}</span>
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <NotificationBell companyId={company.id} />
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
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes de Aprobar</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingApproval}</div>
              <p className="text-xs text-muted-foreground">Requieren aprobación</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.receivable}</div>
              <p className="text-xs text-muted-foreground">Facturas emitidas sin pagar</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Pagar</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.payable}</div>
              <p className="text-xs text-muted-foreground">Facturas de proveedores</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">Requieren gestión de cobro/pago</p>
            </CardContent>
          </Card>
        </div>

        {/* Recordatorio para sincronizar condición IVA - Solo si tiene certificado pero aún no sincronizó */}
        {isAfipVerified && certificate?.environment === 'production' && (!company.taxCondition || !['registered_taxpayer', 'monotax', 'exempt', 'final_consumer'].includes(company.taxCondition)) && hasPermission(userRole, 'company.update') && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-amber-900 text-sm">📊 Sincronizá tu Condición IVA desde AFIP
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Tu condición fiscal actual fue inferida del CUIT. Para obtener la condición oficial desde el padrón de AFIP, andá a <strong>Configuración → Facturación</strong> y presioná el botón de sincronización.
              </p>
            </div>
            <Button 
              size="sm" 
              className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
              onClick={() => router.push(`/company/${company.id}/settings`)}
            >
              Ir a Configuración
            </Button>
          </div>
        )}

        {/* Banner de Estado de Verificación AFIP - Visible para todos */}
        {isAfipVerified ? (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-blue-900 text-sm">
                ✓ Cuenta Verificada con AFIP
              </p>
              <p className="text-xs text-blue-800 mt-0.5">
                Todas las funciones están habilitadas. Podés emitir facturas electrónicas oficiales y consultar datos fiscales automáticamente.
              </p>
            </div>
            {hasPermission(userRole, 'company.view_settings') && (
              <Button 
                size="sm" 
                variant="outline"
                className="border-blue-600 text-blue-700 hover:bg-blue-100 flex-shrink-0"
                onClick={() => router.push(`/company/${company.id}/verify`)}
              >
                Ver Detalles
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Eye className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-blue-900 text-sm">🔓 Modo Vista Previa Activo</p>
              <p className="text-xs text-blue-800 mt-1">
                Podés explorar el sistema y ver cómo funciona cada sección, pero todas las acciones están bloqueadas hasta que verifiques tu cuenta con AFIP.
              </p>
              <p className="text-xs text-blue-700 mt-2 font-medium">
                La verificación con AFIP garantiza la seguridad y legalidad de todas las operaciones en el sistema.
              </p>
            </div>
            <Button 
              size="sm"
              onClick={() => router.push(`/company/${company.id}/verify`)}
            >
              Verificar Ahora
            </Button>
          </div>
        )}



        {/* Main Menu */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1.5">Gestión de Comprobantes</h2>
            <p className="text-sm text-muted-foreground">
              Selecciona una opción para gestionar los comprobantes de {company.name}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item: MenuItem, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                onClick={item.action}
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#002bff] via-[#0078ff] to-[#0000d4] group-hover:scale-110 transition-transform flex-shrink-0">
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1.5">Funcionalidades Adicionales</h2>
            <p className="text-sm text-muted-foreground">
              Herramientas avanzadas para optimizar tu gestión de facturación
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                onClick={item.action}
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#002bff] via-[#0078ff] to-[#0000d4] group-hover:scale-110 transition-transform flex-shrink-0">
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
