"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Plus, UserPlus, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { companyService, Company } from "@/services/company.service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { translateRole } from "@/lib/role-utils"

export function DashboardSidebar() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      loadCompanies()
    }
  }, [isAuthenticated])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const data = await companyService.getCompanies()
      setCompanies(data)
    } catch (error: any) {
      toast.error('Error al cargar perfiles')
    } finally {
      setLoading(false)
    }
  }

  const activeCompanies = companies.filter(c => c.isActive)
  const displayedCompanies = activeCompanies.slice(0, 3)
  const filteredCompanies = activeCompanies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <aside className="w-80 border-r bg-background p-6">
      <div className="space-y-6">
        {/* Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            <CardDescription>
              Registra tu perfil o únete como miembro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              size="sm"
              onClick={() => router.push('/create-company')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Perfil Fiscal
            </Button>
            <p className="text-xs text-muted-foreground px-1">
              Crea tu perfil como empresa, monotributista o consumidor final
            </p>
            <div className="border-t pt-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={() => router.push('/join-company')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Unirse como Miembro
              </Button>
              <p className="text-xs text-muted-foreground px-1 mt-2">
                Únete a una empresa existente con código de invitación
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              Mis Perfiles
              {!loading && <Badge variant="secondary">{activeCompanies.length}</Badge>}
            </CardTitle>
            <CardDescription>
              Perfiles fiscales donde tienes acceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              </div>
            ) : activeCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No tienes perfiles</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Registra tu perfil fiscal o únete como miembro a una empresa
                </p>
                <Button 
                  size="sm"
                  onClick={() => router.push('/create-company')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Perfil
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/company/${company.id}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {company.uniqueId}</p>
                        <p className="text-xs text-muted-foreground">{translateRole(company.role || 'operator')}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {activeCompanies.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowDialog(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Ver todos ({activeCompanies.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Dialog para ver todos los perfiles */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Mis Perfiles Fiscales</DialogTitle>
            <DialogDescription>
              Busca y selecciona un perfil para acceder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No se encontraron perfiles</p>
                </div>
              ) : (
                filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      router.push(`/company/${company.id}`)
                      setShowDialog(false)
                      setSearchTerm('')
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {company.uniqueId}</p>
                        <p className="text-xs text-muted-foreground">{translateRole(company.role || 'operator')}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
