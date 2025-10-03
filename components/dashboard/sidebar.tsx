"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Plus, UserPlus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
interface SidebarCompany {
  id: number
  nombre: string
  uniqueId: string
  inviteCode: string
  role: string
  status: string
  unreadNotifications: number
  createdAt: string
  memberCount: number
}

// Mock companies data
const mockCompanies: SidebarCompany[] = [
  { 
    id: 1, 
    nombre: "TechCorp SA", 
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
    nombre: "StartupXYZ", 
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
    nombre: "Consulting LLC", 
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
                        <p className="font-medium text-sm">{company.nombre}</p>
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

      </div>
    </aside>
  )
}