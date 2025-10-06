"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Users, Crown, Calculator, User, MoreVertical, UserMinus, Settings, TrendingUp, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { CompanyRole, CompanyMember } from "@/types"

// Mock members data
const mockMembers: CompanyMember[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan@techcorp.com",
    role: "Administrador",
    joinedAt: "2024-01-15",
    lastActive: "2024-01-25T14:30:00Z"
  },
  {
    id: "2", 
    name: "María González",
    email: "maria@techcorp.com",
    role: "Contador",
    joinedAt: "2024-01-18",
    lastActive: "2024-01-25T10:15:00Z"
  },
  {
    id: "3",
    name: "Carlos López",
    email: "carlos@techcorp.com", 
    role: "Aprobador",
    joinedAt: "2024-01-20",
    lastActive: "2024-01-24T16:45:00Z"
  },
  {
    id: "4",
    name: "Ana Martín",
    email: "ana@techcorp.com",
    role: "Operador", 
    joinedAt: "2024-01-22",
    lastActive: "2024-01-25T09:20:00Z"
  }
]

export default function MembersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [members, setMembers] = useState<CompanyMember[]>(mockMembers)
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [newRole, setNewRole] = useState<CompanyRole>("Operador")

  // Simular rol del usuario actual
  const currentUserRole = "Administrador" // En producción vendría del contexto

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const getRoleIcon = (role: CompanyRole) => {
    switch (role) {
      case "Administrador":
        return <Crown className="h-4 w-4 text-yellow-600" />
      case "Director Financiero":
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      case "Contador":
        return <Calculator className="h-4 w-4 text-blue-600" />
      case "Aprobador":
        return <Check className="h-4 w-4 text-green-600" />
      case "Operador":
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: CompanyRole) => {
    switch (role) {
      case "Administrador":
        return <Badge className="bg-yellow-100 text-yellow-800">Administrador</Badge>
      case "Director Financiero":
        return <Badge className="bg-purple-100 text-purple-800">Director Financiero</Badge>
      case "Contador":
        return <Badge className="bg-blue-100 text-blue-800">Contador</Badge>
      case "Aprobador":
        return <Badge className="bg-green-100 text-green-800">Aprobador</Badge>
      case "Operador":
        return <Badge variant="secondary">Operador</Badge>
    }
  }

  const openRoleModal = (member: CompanyMember) => {
    setSelectedMember(member)
    setNewRole(member.role)
    setShowRoleModal(true)
  }

  const openRemoveModal = (member: CompanyMember) => {
    setSelectedMember(member)
    setShowRemoveModal(true)
  }

  const changeRole = () => {
    if (!selectedMember) return

    // Confirmación especial para crear administradores
    if (newRole === "Administrador" && selectedMember.role !== "Administrador") {
      const confirmed = window.confirm(
        `¿Estás seguro de otorgar permisos de Administrador a ${selectedMember.name}? Tendrá control total de la empresa.`
      )
      if (!confirmed) return
    }

    setMembers(prev => prev.map(member => 
      member.id === selectedMember.id 
        ? { ...member, role: newRole }
        : member
    ))

    toast.success('Rol actualizado', {
      description: `${selectedMember.name} ahora es ${newRole}`
    })

    setShowRoleModal(false)
    setSelectedMember(null)
  }

  const removeMember = () => {
    if (!selectedMember) return

    setMembers(prev => prev.filter(member => member.id !== selectedMember.id))

    toast.success('Miembro removido', {
      description: `${selectedMember.name} fue removido de la empresa`
    })

    setShowRemoveModal(false)
    setSelectedMember(null)
  }

  const canManageMembers = currentUserRole === "Administrador"
  const currentUserId = "1" // En producción vendría del contexto
  
  const canChangeRole = (member: CompanyMember) => {
    if (!canManageMembers) return false
    if (member.id === currentUserId) return false // No puede cambiar su propio rol
    if (member.role === "Administrador" && currentUserRole !== "Administrador") return false
    return true
  }
  
  const canRemoveMember = (member: CompanyMember) => {
    if (!canManageMembers) return false
    if (member.id === currentUserId) return false // No puede removerse a sí mismo
    const adminCount = members.filter(m => m.role === "Administrador").length
    if (member.role === "Administrador" && adminCount <= 1) return false // Mínimo 1 admin
    return true
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Miembros de la Empresa</h1>
            <p className="text-muted-foreground">Gestionar usuarios y permisos</p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Miembros</p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <Crown className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-800">{members.filter(m => m.role === "Administrador").length}</p>
              <p className="text-xs text-yellow-600">Administradores</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-800">{members.filter(m => m.role === "Director Financiero").length}</p>
              <p className="text-xs text-purple-600">Dir. Financiero</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <Calculator className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-800">{members.filter(m => m.role === "Contador").length}</p>
              <p className="text-xs text-blue-600">Contadores</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <Check className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-800">{members.filter(m => m.role === "Aprobador").length}</p>
              <p className="text-xs text-green-600">Aprobadores</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <User className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-800">{members.filter(m => m.role === "Operador").length}</p>
              <p className="text-xs text-gray-600">Operadores</p>
            </div>
          </div>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Miembros
            </CardTitle>
            <CardDescription>
              {canManageMembers 
                ? "Gestiona roles y permisos de los miembros"
                : "Visualiza los miembros de la empresa"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.name}</h3>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>Unido: {new Date(member.joinedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Último acceso: {new Date(member.lastActive).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getRoleBadge(member.role)}
                    
                    {(canChangeRole(member) || canRemoveMember(member)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canChangeRole(member) && (
                            <DropdownMenuItem onClick={() => openRoleModal(member)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Cambiar Rol
                            </DropdownMenuItem>
                          )}
                          {(canChangeRole(member) && canRemoveMember(member)) && <DropdownMenuSeparator />}
                          {canRemoveMember(member) && (
                            <DropdownMenuItem 
                              onClick={() => openRemoveModal(member)}
                              className="text-red-600"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Change Role Modal */}
        <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cambiar Rol</DialogTitle>
              <DialogDescription>
                Cambiar el rol de {selectedMember?.name} en la empresa
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nuevo Rol</label>
                <Select value={newRole} onValueChange={(value: CompanyRole) => setNewRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Director Financiero">Director Financiero</SelectItem>
                    <SelectItem value="Contador">Contador</SelectItem>
                    <SelectItem value="Aprobador">Aprobador</SelectItem>
                    <SelectItem value="Operador">Operador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Administrador:</strong> Control total, gestión de miembros</p>
                <p><strong>Director Financiero:</strong> Todas las operaciones + aprobaciones</p>
                <p><strong>Contador:</strong> Crear facturas, procesar pagos, estadísticas</p>
                <p><strong>Aprobador:</strong> Solo aprobar facturas de proveedores</p>
                <p><strong>Operador:</strong> Visualización y tareas básicas</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleModal(false)}>
                Cancelar
              </Button>
              <Button onClick={changeRole}>
                Cambiar Rol
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Member Modal */}
        <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover Miembro</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres remover a {selectedMember?.name} de la empresa?
              </DialogDescription>
            </DialogHeader>
            
            <div className="text-sm text-muted-foreground">
              <p>Esta acción no se puede deshacer. El usuario perderá acceso a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todas las facturas y pagos de la empresa</li>
                <li>Estadísticas y reportes</li>
                <li>Configuraciones de la empresa</li>
              </ul>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRemoveModal(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={removeMember}>
                Remover Miembro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}