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
  Download,
  Filter,
  Bell,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Activity,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

// Mock company data with notification counts - Una de cada condición fiscal
const mockCompanies = [
  { 
    id: 1, 
    name: "TechCorp SA", 
    uniqueId: "TC8X9K2L",
    role: "Administrador", 
    memberCount: 12,
    totalInvoices: 156,
    pendingPayments: 8,
    monthlyRevenue: 45000,
    pendingApprovals: 3,
    pendingConfirmations: 2,
    rejectedInvoices: 1,
    invoicesToPay: 5,
    condicionIva: "RI" as const,
    canIssueInvoices: true
  },
  { 
    id: 2, 
    name: "Emprendimientos Juan Pérez", 
    uniqueId: "SU4P7M9N",
    role: "Administrador", 
    memberCount: 1,
    totalInvoices: 89,
    pendingPayments: 3,
    monthlyRevenue: 12000,
    pendingApprovals: 0,
    pendingConfirmations: 0,
    rejectedInvoices: 0,
    invoicesToPay: 2,
    condicionIva: "Monotributo" as const,
    canIssueInvoices: true
  },
  { 
    id: 3, 
    name: "Cooperativa de Trabajo Unidos", 
    uniqueId: "CL1Q3R8T",
    role: "Contador", 
    memberCount: 8,
    totalInvoices: 234,
    pendingPayments: 12,
    monthlyRevenue: 28000,
    pendingApprovals: 0,
    pendingConfirmations: 1,
    rejectedInvoices: 0,
    invoicesToPay: 8,
    condicionIva: "Exento" as const,
    canIssueInvoices: true
  },
  { 
    id: 4, 
    name: "María López", 
    uniqueId: "ML5K2P8W",
    role: "Administrador", 
    memberCount: 1,
    totalInvoices: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    pendingConfirmations: 0,
    rejectedInvoices: 0,
    invoicesToPay: 3,
    condicionIva: "CF" as const,
    canIssueInvoices: false
  },
]

export default function CompanyPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  
  const [company] = useState(mockCompanies.find(c => c.uniqueId === companyId))

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) return null
  if (!isAuthenticated) return null
  if (!company) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Empresa no encontrada</h1>
          <Button onClick={() => router.push('/dashboard')}>Volver al Dashboard</Button>
        </div>
      </div>
    )
  }

  const menuItems = [
    ...(company.canIssueInvoices ? [{
      title: "Emitir Factura",
      description: "Crear nueva factura para clientes",
      icon: FileText,
      color: "bg-blue-500",
      action: () => router.push(`/company/${company?.uniqueId}/emit-invoice`)
    }] : []),
    {
      title: "Cargar Factura Recibida",
      description: "Registrar factura de empresa externa",
      icon: Plus,
      color: "bg-teal-500",
      action: () => router.push(`/company/${company?.uniqueId}/load-invoice`)
    },
    {
      title: "Ver Facturas",
      description: "Gestionar todas las facturas",
      icon: FileText,
      color: "bg-purple-500",
      action: () => router.push(`/company/${company?.uniqueId}/invoices`)
    },
    {
      title: "Pagar Facturas",
      description: "Procesar pagos pendientes",
      icon: CreditCard,
      color: "bg-orange-500",
      badge: company.invoicesToPay,
      action: () => router.push(`/company/${company?.uniqueId}/payments`)
    },
    ...(company.canIssueInvoices ? [{
      title: "Confirmar Pagos",
      description: "Revisar pagos recibidos",
      icon: Eye,
      color: "bg-yellow-500",
      badge: company.pendingConfirmations,
      action: () => router.push(`/company/${company?.uniqueId}/confirm-payments`)
    }] : []),
    ...(company.canIssueInvoices ? [{
      title: "Aprobar Facturas",
      description: "Revisar facturas de proveedores",
      icon: CheckSquare,
      color: "bg-green-500",
      badge: company.pendingApprovals,
      action: () => router.push(`/company/${company?.uniqueId}/approve-invoices`)
    }] : []),
    ...(company.canIssueInvoices ? [{
      title: "Facturas Rechazadas",
      description: "Gestionar facturas que requieren atención",
      icon: AlertTriangle,
      color: "bg-red-500",
      badge: company.rejectedInvoices,
      action: () => router.push(`/company/${company?.uniqueId}/rejected-invoices`)
    }] : []),
    {
      title: "Registro de Auditoría",
      description: "Historial de actividades del sistema",
      icon: Activity,
      color: "bg-gray-600",
      action: () => router.push(`/company/${company?.uniqueId}/audit-log`)
    },
    {
      title: "Estadísticas",
      description: "Reportes y análisis financiero",
      icon: BarChart3,
      color: "bg-indigo-500",
      action: () => router.push(`/company/${company?.uniqueId}/analytics`)
    },
    {
      title: "Vencimientos",
      description: "Control de fechas y cobros pendientes",
      icon: Calendar,
      color: "bg-pink-500",
      action: () => router.push(`/company/${company?.uniqueId}/due-invoices`)
    }
  ]

  const additionalItems = [
    {
      title: "Mis Clientes",
      description: "Gestionar clientes externos",
      icon: Users,
      color: "bg-blue-500",
      action: () => router.push(`/company/${company?.uniqueId}/clients`)
    },
    {
      title: "Red Empresarial",
      description: "Conectar con otras empresas",
      icon: Users,
      color: "bg-pink-500",
      action: () => router.push(`/company/${company?.uniqueId}/network`)
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
            <p className="text-muted-foreground">Tu rol: {company.role} • ID: {company.uniqueId}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/company/${company?.uniqueId}/members`)}
            >
              <Users className="h-4 w-4 mr-2" />
              {company.memberCount} miembros
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/company/${company?.uniqueId}/settings`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Facturas</p>
                  <p className="text-2xl font-bold">{company.totalInvoices}</p>
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
                  <p className="text-2xl font-bold text-orange-600">{company.pendingPayments}</p>
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
                  <p className="text-2xl font-bold text-green-600">${company.monthlyRevenue.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Miembros Activos</p>
                  <p className="text-2xl font-bold">{company.memberCount}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta para Consumidor Final */}
        {!company.canIssueInvoices && (
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