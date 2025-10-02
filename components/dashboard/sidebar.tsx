"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Plus, UserPlus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Company, Activity } from "@/types"

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'invoice_created': return 'bg-green-500'
    case 'member_joined': return 'bg-blue-500'
    case 'payment_pending': return 'bg-orange-500'
    case 'payment_received': return 'bg-emerald-500'
    case 'company_created': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

// Mock activities data
const mockActivities: Activity[] = [
  {
    id: 1,
    type: 'invoice_created',
    message: 'Factura creada',
    companyName: 'TechCorp SA',
    timestamp: 'hace 2h'
  },
  {
    id: 2,
    type: 'member_joined',
    message: 'Nuevo miembro',
    companyName: 'StartupXYZ',
    timestamp: 'hace 1d'
  },
  {
    id: 3,
    type: 'payment_pending',
    message: 'Pago pendiente',
    companyName: 'Consulting LLC',
    timestamp: 'hace 2d'
  },
  {
    id: 4,
    type: 'payment_received',
    message: 'Pago recibido',
    companyName: 'TechCorp SA',
    timestamp: 'hace 3d'
  },
  {
    id: 5,
    type: 'company_created',
    message: 'Empresa creada',
    companyName: 'StartupXYZ',
    timestamp: 'hace 1 semana'
  }
]

// Mock companies data
const mockCompanies: Company[] = [
  { 
    id: 1, 
    name: "TechCorp SA", 
    uniqueId: "TC8X9K2L",
    inviteCode: "ADMIN-TECH-2024", // Código para Administrador
    role: "Administrador", 
    status: "active", 
    unreadNotifications: 3,
    createdAt: "2024-01-15",
    memberCount: 12
  },
  { 
    id: 2, 
    name: "StartupXYZ", 
    uniqueId: "SU4P7M9N",
    inviteCode: "COUNT-START-2024", // Código para Contador
    role: "Contador", 
    status: "active", 
    unreadNotifications: 0,
    createdAt: "2024-02-20",
    memberCount: 5
  },
  { 
    id: 3, 
    name: "Consulting LLC", 
    uniqueId: "CL1Q3R8T",
    inviteCode: "MEMBER-CONSULT-2024", // Código para Miembro
    role: "Miembro", 
    status: "active", 
    unreadNotifications: 1,
    createdAt: "2024-03-10",
    memberCount: 8
  },
]

export function DashboardSidebar() {
  const [companies] = useState(mockCompanies)
  const [activities] = useState(mockActivities.slice(0, 3))
  const activeCompanies = companies.filter(c => c.status === 'active')
  const router = useRouter()

  return (
    <aside className="w-80 border-r bg-background p-6">
      <div className="space-y-6">
        {/* Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Gestión de Empresas</CardTitle>
            <CardDescription>
              Crea o únete a empresas para gestionar facturas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              size="sm"
              onClick={() => router.push('/create-company')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Empresa
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="sm"
              onClick={() => router.push('/join-company')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Unirse a Empresa
            </Button>
          </CardContent>
        </Card>

        {/* Companies List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Mis Empresas
              <Badge variant="secondary">{activeCompanies.length}</Badge>
            </CardTitle>
            <CardDescription>
              Empresas donde tienes acceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No tienes empresas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea tu primera empresa o solicita unirte a una existente
                </p>
                <Button 
                  size="sm"
                  onClick={() => router.push('/create-company')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Empresa
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/company/${company.uniqueId}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.role}</p>
                        <p className="text-xs font-mono text-muted-foreground">ID: {company.uniqueId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {company.unreadNotifications > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                          {company.unreadNotifications}
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones en tus empresas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`h-2 w-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.companyName} • {activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


      </div>
    </aside>
  )
}