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
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

// Mock company data
const mockCompanies = [
  { 
    id: 1, 
    name: "TechCorp SA", 
    uniqueId: "TC8X9K2L",
    role: "Administrador", 
    memberCount: 12,
    totalInvoices: 156,
    pendingPayments: 8,
    monthlyRevenue: 45000
  },
  { 
    id: 2, 
    name: "StartupXYZ", 
    uniqueId: "SU4P7M9N",
    role: "Contador", 
    memberCount: 5,
    totalInvoices: 89,
    pendingPayments: 3,
    monthlyRevenue: 12000
  },
  { 
    id: 3, 
    name: "Consulting LLC", 
    uniqueId: "CL1Q3R8T",
    role: "Miembro", 
    memberCount: 8,
    totalInvoices: 234,
    pendingPayments: 12,
    monthlyRevenue: 28000
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
    {
      title: "Cargar Factura",
      description: "Crear nueva factura para clientes",
      icon: FileText,
      color: "bg-blue-500",
      action: () => router.push(`/company/${company?.uniqueId}/create-invoice`)
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
      action: () => router.push(`/company/${company?.uniqueId}/payments`)
    },
    {
      title: "Confirmar Pagos",
      description: "Revisar pagos recibidos",
      icon: Eye,
      color: "bg-yellow-500",
      action: () => router.push(`/company/${company?.uniqueId}/confirm-payments`)
    },
    {
      title: "Aprobar Facturas",
      description: "Revisar facturas de proveedores",
      icon: FileText,
      color: "bg-purple-500",
      action: () => router.push(`/company/${company?.uniqueId}/approve-invoices`)
    },
    {
      title: "Estadísticas",
      description: "Reportes y análisis financiero",
      icon: BarChart3,
      color: "bg-indigo-500",
      action: () => router.push(`/company/${company?.uniqueId}/analytics`)
    }
  ]

  const additionalItems = [
    {
      title: "Gestión de Clientes",
      description: "Administrar base de datos de clientes",
      icon: Users,
      color: "bg-pink-500"
    },
    {
      title: "Plantillas de Factura",
      description: "Crear y gestionar plantillas personalizadas",
      icon: FileText,
      color: "bg-cyan-500"
    },
    {
      title: "Recordatorios de Pago",
      description: "Automatizar seguimiento de pagos",
      icon: Bell,
      color: "bg-yellow-500"
    },
    {
      title: "Backup & Exportar",
      description: "Respaldar datos y exportar reportes",
      icon: Download,
      color: "bg-gray-600"
    }
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">Tu rol: {company.role} • ID: {company.uniqueId}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {company.memberCount} miembros
            </Button>
            <Button variant="outline" size="sm">
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

        {/* Main Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Facturas</CardTitle>
            <CardDescription>
              Selecciona una opción para gestionar las facturas de {company.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
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
                <Card key={index} className="cursor-pointer hover:shadow-sm transition-shadow">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Datos
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Avanzados
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Vencimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Factura #1234</p>
                    <p className="text-xs text-muted-foreground">Cliente ABC</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">Vence hoy</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Factura #1235</p>
                    <p className="text-xs text-muted-foreground">Cliente XYZ</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">3 días</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Ver todos los vencimientos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}