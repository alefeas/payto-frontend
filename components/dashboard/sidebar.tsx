"use client"

import { useState } from "react"
import { Building2, Plus, UserPlus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock companies data
const mockCompanies = [
  { id: 1, name: "TechCorp SA", role: "Administrador", status: "active", unreadNotifications: 3 },
  { id: 2, name: "StartupXYZ", role: "Contador", status: "active", unreadNotifications: 0 },
  { id: 3, name: "Consulting LLC", role: "Miembro", status: "pending", unreadNotifications: 1 },
]

export function DashboardSidebar() {
  const [companies] = useState(mockCompanies)
  const activeCompanies = companies.filter(c => c.status === 'active')

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
            <Button className="w-full justify-start" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Crear Empresa
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
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
                <Button size="sm">
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
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.role}</p>
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

        {/* Pending Invitations */}
        {companies.some(c => c.status === 'pending') && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Invitaciones Pendientes</CardTitle>
              <CardDescription>
                Solicitudes para unirte a empresas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {companies
                .filter(c => c.status === 'pending')
                .map((company) => (
                  <div key={company.id} className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-yellow-50 border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{company.name}</p>
                          <p className="text-xs text-muted-foreground">Como {company.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 px-3">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                        Rechazar
                      </Button>
                      <Button size="sm" className="flex-1 h-8 text-xs">
                        Aceptar
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  )
}