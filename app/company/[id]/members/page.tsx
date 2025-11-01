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
import { companyMemberService } from "@/services/company-member.service"
import { companyService, Company } from "@/services/company.service"
import { translateRole, getRoleDescription } from "@/lib/role-utils"

export default function MembersPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showAdminConfirmModal, setShowAdminConfirmModal] = useState(false)
  const [showOwnerTransferModal, setShowOwnerTransferModal] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [newRole, setNewRole] = useState<CompanyRole>("operator")
  const [updating, setUpdating] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, authLoading, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [companyData, membersData] = await Promise.all([
        companyService.getCompanyById(companyId),
        companyMemberService.getMembers(companyId)
      ])
      setCompany(companyData)
      setMembers(membersData)
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error(error.response?.data?.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: CompanyRole) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-amber-600" />
      case "administrator":
        return <Crown className="h-4 w-4 text-yellow-600" />
      case "financial_director":
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      case "accountant":
        return <Calculator className="h-4 w-4 text-blue-600" />
      case "approver":
        return <Check className="h-4 w-4 text-green-600" />
      case "operator":
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: CompanyRole) => {
    const label = translateRole(role)
    switch (role) {
      case "owner":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">{label}</Badge>
      case "administrator":
        return <Badge className="bg-yellow-100 text-yellow-800">{label}</Badge>
      case "financial_director":
        return <Badge className="bg-purple-100 text-purple-800">{label}</Badge>
      case "accountant":
        return <Badge className="bg-blue-100 text-blue-800">{label}</Badge>
      case "approver":
        return <Badge className="bg-green-100 text-green-800">{label}</Badge>
      case "operator":
        return <Badge variant="secondary">{label}</Badge>
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

  const changeRole = async () => {
    if (!selectedMember) return

    if (newRole === "owner") {
      setShowOwnerTransferModal(true)
      return
    }

    if (newRole === "administrator" && selectedMember.role !== "administrator") {
      setShowAdminConfirmModal(true)
      return
    }

    await executeRoleChange()
  }

  const executeRoleChange = async (code?: string) => {
    if (!selectedMember) return

    try {
      setUpdating(true)
      const updatedMember = await companyMemberService.updateMemberRole(companyId, selectedMember.id, newRole, code)
      
      setMembers(prev => prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      ))

      // Si se transfirió ownership, actualizar el rol del usuario actual
      if (newRole === "owner") {
        await loadData()
        toast.success('Propiedad transferida', {
          description: `${selectedMember.name} ahora es el propietario. Tu rol cambió a Administrador.`
        })
      } else {
        toast.success('Rol actualizado', {
          description: `${selectedMember.name} ahora es ${translateRole(newRole)}`
        })
      }

      setShowRoleModal(false)
      setShowOwnerTransferModal(false)
      setSelectedMember(null)
      setConfirmationCode("")
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar rol')
    } finally {
      setUpdating(false)
    }
  }

  const removeMember = async () => {
    if (!selectedMember) return

    try {
      setUpdating(true)
      await companyMemberService.removeMember(companyId, selectedMember.id)

      setMembers(prev => prev.filter(member => member.id !== selectedMember.id))

      toast.success('Miembro removido', {
        description: `${selectedMember.name} fue removido de la empresa`
      })

      setShowRemoveModal(false)
      setSelectedMember(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al remover miembro')
    } finally {
      setUpdating(false)
    }
  }

  const canManageMembers = company?.role === "owner" || company?.role === "administrator"
  const isOwner = company?.role === "owner"
  const currentUserId = user?.id
  
  const canChangeRole = (member: CompanyMember) => {
    if (!canManageMembers) return false
    if (member.userId === currentUserId) return false
    if (member.role === "owner" && !isOwner) return false
    return true
  }
  
  const canRemoveMember = (member: CompanyMember) => {
    if (!canManageMembers) return false
    if (member.userId === currentUserId) return false
    if (member.role === "owner") return false
    const adminCount = members.filter(m => m.role === "administrator").length
    if (member.role === "administrator" && adminCount <= 1) return false
    return true
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <Card>
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Código de Invitación</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded font-mono text-sm">
                      {company?.inviteCode || 'Cargando...'}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(company?.inviteCode || '')
                        toast.success('Código copiado al portapapeles')
                      }}
                    >
                      Copiar
                    </Button>
                    {canManageMembers && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={regenerating}
                        onClick={async () => {
                          try {
                            setRegenerating(true)
                            const result = await companyService.regenerateInviteCode(companyId)
                            setCompany(prev => prev ? { ...prev, inviteCode: result.inviteCode } : null)
                            toast.success('Código regenerado exitosamente')
                          } catch (error: any) {
                            toast.error(error.response?.data?.message || 'Error al regenerar código')
                          } finally {
                            setRegenerating(false)
                          }
                        }}
                      >
                        {regenerating ? 'Regenerando...' : 'Regenerar'}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Comparte este código para invitar nuevos miembros
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <Crown className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-amber-800">{members.filter(m => m.role === "owner").length}</p>
              <p className="text-xs text-amber-600">Propietario</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <Crown className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-800">{members.filter(m => m.role === "administrator").length}</p>
              <p className="text-xs text-yellow-600">Administradores</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-800">{members.filter(m => m.role === "financial_director").length}</p>
              <p className="text-xs text-purple-600">Dir. Financiero</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <Calculator className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-800">{members.filter(m => m.role === "accountant").length}</p>
              <p className="text-xs text-blue-600">Contadores</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <Check className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-800">{members.filter(m => m.role === "approver").length}</p>
              <p className="text-xs text-green-600">Aprobadores</p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <User className="h-5 w-5 text-gray-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-800">{members.filter(m => m.role === "operator").length}</p>
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
                        {member.name?.split(' ').map(n => n[0]).join('') || 'U'}
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
                    {isOwner && <SelectItem value="owner">{translateRole('owner')}</SelectItem>}
                    <SelectItem value="administrator">{translateRole('administrator')}</SelectItem>
                    <SelectItem value="financial_director">{translateRole('financial_director')}</SelectItem>
                    <SelectItem value="accountant">{translateRole('accountant')}</SelectItem>
                    <SelectItem value="approver">{translateRole('approver')}</SelectItem>
                    <SelectItem value="operator">{translateRole('operator')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                {isOwner && <p><strong>{translateRole('owner')}:</strong> {getRoleDescription('owner')}</p>}
                <p><strong>{translateRole('administrator')}:</strong> {getRoleDescription('administrator')}</p>
                <p><strong>{translateRole('financial_director')}:</strong> {getRoleDescription('financial_director')}</p>
                <p><strong>{translateRole('accountant')}:</strong> {getRoleDescription('accountant')}</p>
                <p><strong>{translateRole('approver')}:</strong> {getRoleDescription('approver')}</p>
                <p><strong>{translateRole('operator')}:</strong> {getRoleDescription('operator')}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleModal(false)} disabled={updating}>
                Cancelar
              </Button>
              <Button onClick={changeRole} disabled={updating}>
                {updating ? 'Actualizando...' : 'Cambiar Rol'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Admin Confirmation Modal */}
        <Dialog open={showAdminConfirmModal} onOpenChange={setShowAdminConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Otorgar Permisos de Administrador
              </DialogTitle>
              <DialogDescription>
                Estás a punto de otorgar permisos de administrador a {selectedMember?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Permisos que se otorgarán:</h4>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Control total de la empresa</li>
                  <li>Gestión de miembros y roles</li>
                  <li>Acceso a configuración completa</li>
                  <li>Todas las operaciones financieras</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <strong>Importante:</strong> Los administradores tienen casi los mismos permisos que el propietario, excepto transferir la propiedad.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdminConfirmModal(false)} disabled={updating}>
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  setShowAdminConfirmModal(false)
                  await executeRoleChange()
                }} 
                disabled={updating}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Sí, Otorgar Permisos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Owner Transfer Modal */}
        <Dialog open={showOwnerTransferModal} onOpenChange={setShowOwnerTransferModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                Transferir Propiedad de la Empresa
              </DialogTitle>
              <DialogDescription>
                Estás a punto de transferir la propiedad a {selectedMember?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Acción Crítica</h4>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Perderás el rol de propietario</li>
                  <li>Pasarás a ser administrador</li>
                  <li>Solo el nuevo propietario podrá revertir esto</li>
                  <li>Esta acción requiere confirmación</li>
                </ul>
              </div>
              
              <div>
                <label className="text-sm font-medium">Código de Confirmación</label>
                <input
                  type="password"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Ingresa el código de eliminación de la empresa"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usa el mismo código que usarías para eliminar la empresa
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowOwnerTransferModal(false)
                setConfirmationCode("")
              }} disabled={updating}>
                Cancelar
              </Button>
              <Button 
                onClick={() => executeRoleChange(confirmationCode)} 
                disabled={updating || !confirmationCode}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {updating ? 'Transfiriendo...' : 'Transferir Propiedad'}
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
              <Button variant="outline" onClick={() => setShowRemoveModal(false)} disabled={updating}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={removeMember} disabled={updating}>
                {updating ? 'Removiendo...' : 'Remover Miembro'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
