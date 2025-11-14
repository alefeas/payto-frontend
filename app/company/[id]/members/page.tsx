"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { Users, Crown, Calculator, User, MoreVertical, UserMinus, Settings, TrendingUp, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveHeading, ResponsiveText } from "@/components/ui/responsive-heading"
import { CountBadge } from "@/components/ui/count-badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { CompanyRole, CompanyMember } from "@/types"
import { companyMemberService } from "@/services/company-member.service"
import { companyService, Company } from "@/services/company.service"
import { translateRole, getRoleDescription } from "@/lib/role-utils"
import { parseDateLocal } from "@/lib/utils"

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
  const [searchQuery, setSearchQuery] = useState("")

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

  // Orden de roles por jerarquía
  const roleOrder: Record<CompanyRole, number> = {
    owner: 1,
    administrator: 2,
    financial_director: 3,
    accountant: 4,
    approver: 5,
    operator: 6,
  }

  const getRoleIcon = (role: CompanyRole) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-blue-600" />
      case "administrator":
        return <Settings className="h-4 w-4 text-blue-500" />
      case "financial_director":
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case "accountant":
        return <Calculator className="h-4 w-4 text-blue-400" />
      case "approver":
        return <Check className="h-4 w-4 text-blue-400" />
      case "operator":
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role: CompanyRole) => {
    const label = translateRole(role)
    switch (role) {
      case "owner":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{label}</Badge>
      case "administrator":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">{label}</Badge>
      case "financial_director":
        return <Badge className="bg-sky-50 text-sky-700 border-sky-200">{label}</Badge>
      case "accountant":
        return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200">{label}</Badge>
      case "approver":
        return <Badge className="bg-teal-50 text-teal-700 border-teal-200">{label}</Badge>
      case "operator":
        return <Badge variant="secondary">{label}</Badge>
    }
  }

  // Filtrar y ordenar miembros
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members
    
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = members.filter(member => 
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      )
    }
    
    // Ordenar por jerarquía de rol
    return [...filtered].sort((a, b) => {
      return roleOrder[a.role] - roleOrder[b.role]
    })
  }, [members, searchQuery, roleOrder])

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

  const canManageMembers = company?.role?.toLowerCase() === "owner" || company?.role?.toLowerCase() === "administrator"
  const isOwner = company?.role?.toLowerCase() === "owner"
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
      <div className="min-h-screen bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 pb-8 space-y-4 sm:space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-7 sm:h-8 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Invite Code Skeleton */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <div className="flex flex-col sm:flex-row gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-full sm:w-20" />
                <Skeleton className="h-10 w-full sm:w-24" />
              </div>
              <Skeleton className="h-3 w-64 mt-2" />
            </CardContent>
          </Card>

          {/* Role Stats Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 text-center">
                <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1" />
                <Skeleton className="h-5 sm:h-6 w-6 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>

          {/* Members List Skeleton */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
                  <Skeleton className="h-5 sm:h-6 w-40" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-full sm:w-64" />
            </div>

            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3 pr-10">
                    <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-4 sm:h-5 flex-1" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                      <Skeleton className="h-3 sm:h-4 w-48 mb-2" />
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Skeleton className="h-6 w-24" />
                        <div className="flex gap-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 pb-8 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 w-full">
          <BackButton href={`/company/${companyId}`} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-medium text-gray-900 truncate">
              Miembros
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-0.5 truncate">
              Gestionar usuarios y permisos
            </p>
          </div>
        </div>
        
        {/* Invite Code Card */}
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4">
            <p className="text-sm text-gray-500 font-light mb-2">Código de Invitación</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <code className="flex-1 min-w-0 px-2 sm:px-3 py-2 bg-gray-50 border border-gray-200 rounded font-mono text-xs sm:text-sm text-gray-900 break-all">
                {company?.inviteCode || 'Cargando...'}
              </code>
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto shrink-0"
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
                  className="w-full sm:w-auto shrink-0"
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
            <p className="text-xs text-gray-500 mt-2">
              Comparte este código para invitar nuevos miembros
            </p>
          </CardContent>
        </Card>

        
        {/* Role Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {[
            { icon: Crown, role: "owner", label: "Propietario", color: "text-blue-600" },
            { icon: Settings, role: "administrator", label: "Admins", color: "text-blue-500" },
            { icon: TrendingUp, role: "financial_director", label: "Dir. Financiero", color: "text-blue-500" },
            { icon: Calculator, role: "accountant", label: "Contadores", color: "text-blue-400" },
            { icon: Check, role: "approver", label: "Aprobadores", color: "text-blue-400" },
            { icon: User, role: "operator", label: "Operadores", color: "text-gray-400" }
          ].map(({ icon: Icon, role, label, color }) => (
            <div key={role} className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 text-center min-w-0">
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color} mx-auto mb-1 shrink-0`} />
              <p className="text-sm sm:text-lg font-bold text-gray-900">{members.filter(m => m.role === role).length}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{label}</p>
            </div>
          ))}
        </div>

        {/* Members List */}
        <div className="space-y-4">
              {/* Header con título y búsqueda */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="flex items-center gap-2 text-base sm:text-lg text-black">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span className="truncate font-medium-heading">Lista de Miembros</span>
                    <CountBadge count={members.length} />
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 font-light mt-0.5 truncate">
                    {canManageMembers ? "Gestiona roles y permisos" : "Visualiza los miembros"}
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-64 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Lista de miembros */}
              <div className="space-y-3">
                {filteredAndSortedMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">
                      {searchQuery ? 'No se encontraron miembros' : 'No hay miembros'}
                    </p>
                  </div>
                ) : (
                  filteredAndSortedMembers.map((member) => (
                    <div key={member.id} className="relative p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      {/* Menu de 3 puntos - Posición absoluta arriba a la derecha */}
                  {(canChangeRole(member) || canRemoveMember(member)) && (
                    <div className="absolute top-3 right-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    </div>
                  )}

                      {/* Contenido del miembro */}
                      <div className="flex items-start gap-3 pr-10">
                        <Avatar className="shrink-0 h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                            {member.name?.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate flex-1 min-w-0">{member.name}</h3>
                            <div className="shrink-0">{getRoleIcon(member.role)}</div>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-2 truncate">{member.email}</p>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            {getRoleBadge(member.role)}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-gray-400">
                              <span className="whitespace-nowrap">Unido: {parseDateLocal(member.joinedAt)?.toLocaleDateString('es-AR')}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="whitespace-nowrap">Último: {parseDateLocal(member.lastActive)?.toLocaleDateString('es-AR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
            </div>
        </div>


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
                <Crown className="h-5 w-5 text-blue-600" />
                Otorgar Permisos de Administrador
              </DialogTitle>
              <DialogDescription>
                Estás a punto de otorgar permisos de administrador a {selectedMember?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Permisos que se otorgarán:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Control total de la empresa</li>
                  <li>Gestión de miembros y roles</li>
                  <li>Acceso a configuración completa</li>
                  <li>Todas las operaciones financieras</li>
                </ul>
              </div>
              
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <p className="text-sm text-sky-900">
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
                className="bg-blue-600 hover:bg-blue-700"
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
                <Crown className="h-5 w-5 text-blue-600" />
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
                <label className="text-sm font-medium text-gray-700">Código de Confirmación</label>
                <input
                  type="password"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Ingresa el código de eliminación de la empresa"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
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
                className="bg-blue-600 hover:bg-blue-700"
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
