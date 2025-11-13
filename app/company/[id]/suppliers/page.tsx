"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Search, Plus, Edit, Trash2, FileText, Mail, Phone, Building2, AlertTriangle, Loader2, Archive, RotateCcw, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { supplierService, Supplier } from "@/services/supplier.service"
import { SupplierForm } from "@/components/suppliers/SupplierForm"
import { ResponsiveHeading, ResponsiveText } from "@/components/ui/responsive-heading"
import { useAfipCertificate } from "@/hooks/use-afip-certificate"
import { AfipGuard } from "@/components/afip/afip-guard"

const condicionIvaLabels: Record<string, string> = {
  registered_taxpayer: "Responsable Inscripto",
  monotax: "Monotributo",
  exempt: "Exento"
}

const condicionIvaColors: Record<string, string> = {
  registered_taxpayer: "bg-blue-100 text-blue-800",
  monotax: "bg-green-100 text-green-800",
  exempt: "bg-purple-100 text-purple-800"
}

export default function SuppliersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCondicion, setFilterCondicion] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [archivedSuppliers, setArchivedSuppliers] = useState<Supplier[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [loadingArchived, setLoadingArchived] = useState(false)
  const [archivingId, setArchivingId] = useState<number | null>(null)
  const [restoringId, setRestoringId] = useState<number | null>(null)

  // AFIP Certificate validation
  const { isVerified: isAfipVerified } = useAfipCertificate(companyId)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (isAuthenticated) {
      loadSuppliers()
    }
  }, [isAuthenticated, authLoading, router, companyId])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const data = await supplierService.getSuppliers(companyId)
      setSuppliers(data)
    } catch (error: any) {
      console.error('Error loading suppliers:', error)
      toast.error(error.response?.data?.message || 'Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }

  const loadArchivedSuppliers = async () => {
    try {
      setLoadingArchived(true)
      const data = await supplierService.getArchivedSuppliers(companyId)
      setArchivedSuppliers(data)
    } catch (error: any) {
      console.error('Error loading archived suppliers:', error)
      toast.error(error.response?.data?.message || 'Error al cargar proveedores archivados')
    } finally {
      setLoadingArchived(false)
    }
  }

  const handleRestore = async (supplierId: string) => {
    try {
      const id = parseInt(supplierId)
      setRestoringId(id)
      await supplierService.restoreSupplier(companyId, id)
      toast.success('Proveedor restaurado')
      loadArchivedSuppliers()
      loadSuppliers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restaurar proveedor')
    } finally {
      setRestoringId(null)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${supplier.firstName} ${supplier.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterCondicion === "all" || supplier.taxCondition === filterCondicion

    return matchesSearch && matchesFilter
  })

  const filteredArchivedSuppliers = archivedSuppliers.filter(supplier => {
    const matchesSearch = 
      supplier.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${supplier.firstName} ${supplier.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterCondicion === "all" || supplier.taxCondition === filterCondicion

    return matchesSearch && matchesFilter
  })

  const getSupplierDisplayName = (supplier: Supplier) => {
    if (supplier.businessName) return supplier.businessName
    if (supplier.firstName && supplier.lastName) return `${supplier.firstName} ${supplier.lastName}`
    return supplier.documentNumber
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>

          {/* Search and Filter Skeleton */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-48" />
          </div>

          {/* Suppliers List Skeleton */}
          <div>
            <div className="mb-4">
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href={`/company/${companyId}`} />
          <div className="flex-1">
            <ResponsiveHeading level="h1">Mis Proveedores</ResponsiveHeading>
            <ResponsiveText className="text-muted-foreground">Gestiona tus proveedores externos</ResponsiveText>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showArchived ? "outline" : "default"}
              onClick={() => {
                setShowArchived(!showArchived)
                if (!showArchived && archivedSuppliers.length === 0) {
                  loadArchivedSuppliers()
                }
              }}
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? "Ver Activos" : "Ver Archivados"}
            </Button>
            {!showArchived && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proveedor
                  </Button>
                </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
                <DialogDescription>
                  Agrega un proveedor externo para gestionar tus compras
                </DialogDescription>
              </DialogHeader>
              <SupplierForm companyId={companyId} onClose={() => setIsCreateDialogOpen(false)} onSuccess={loadSuppliers} />
            </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Mensaje de certificado AFIP requerido */}
        {!isAfipVerified && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <Shield className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-900 text-sm">Certificado AFIP requerido</p>
              <p className="text-xs text-red-700 mt-1">
                No puedes buscar datos fiscales automáticamente en el padrón AFIP sin un certificado activo. Configura tu certificado para autocompletar datos de proveedores.
              </p>
            </div>
            <Button 
              type="button"
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
              onClick={() => router.push(`/company/${companyId}/verify`)}
            >
              Configurar Ahora
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, documento o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Condición:</span>
            <Select value={filterCondicion} onValueChange={setFilterCondicion}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="registered_taxpayer">Responsable Inscripto</SelectItem>
                <SelectItem value="monotax">Monotributo</SelectItem>
                <SelectItem value="exempt">Exento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              {showArchived ? `Proveedores Archivados (${archivedSuppliers.length})` : `Proveedores (${filteredSuppliers.length})`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {showArchived 
                ? "Proveedores archivados que pueden ser restaurados. Necesarios para el Libro IVA histórico."
                : "Lista de proveedores externos registrados"}
            </p>
          </div>
          <div>
            {(showArchived ? loadingArchived : loading) ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold mb-2">Cargando proveedores...</h3>
                <p className="text-muted-foreground">Por favor espera un momento</p>
              </div>
            ) : showArchived ? (
              filteredArchivedSuppliers.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay proveedores archivados</h3>
                  <p className="text-muted-foreground">Los proveedores archivados aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredArchivedSuppliers.map((supplier) => (
                    <Card key={supplier.id} className="p-4 hover:shadow-md transition-shadow bg-muted/30">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm truncate">{getSupplierDisplayName(supplier)}</h3>
                              <Badge className={condicionIvaColors[supplier.taxCondition]}>
                                {condicionIvaLabels[supplier.taxCondition]}
                              </Badge>
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Archivado
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {supplier.documentType}: {supplier.documentNumber}
                              </span>
                              {supplier.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {supplier.email}
                                </span>
                              )}
                              {supplier.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {supplier.phone}
                                </span>
                              )}
                            </div>
                          </div>

                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRestore(supplier.id.toString())}
                            disabled={restoringId === supplier.id}
                          >
                            {restoringId === supplier.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4 mr-2" />
                            )}
                            {restoringId === supplier.id ? 'Restaurando...' : 'Restaurar'}
                          </Button>
                        </div>
                    </Card>
                  ))}
                </div>
              )
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay proveedores</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterCondicion !== "all" 
                    ? "No se encontraron proveedores con los filtros aplicados"
                    : "Comienza agregando tu primer proveedor"}
                </p>
                {!searchTerm && filterCondicion === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Proveedor
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base truncate">{getSupplierDisplayName(supplier)}</h3>
                            <Badge className={condicionIvaColors[supplier.taxCondition]}>
                              {condicionIvaLabels[supplier.taxCondition]}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {supplier.documentType}: {supplier.documentNumber}
                            </span>
                            {supplier.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {supplier.email}
                              </span>
                            )}
                            {supplier.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {supplier.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => {
                              setSelectedSupplier(supplier)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() => {
                              setSupplierToDelete(supplier)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Proveedor</DialogTitle>
              <DialogDescription>
                Actualiza la información del proveedor
              </DialogDescription>
            </DialogHeader>
            <SupplierForm 
              supplier={selectedSupplier}
              companyId={companyId}
              onClose={() => {
                setIsEditDialogOpen(false)
                setSelectedSupplier(null)
              }}
              onSuccess={loadSuppliers}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Archivar Proveedor
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro que deseas archivar a {supplierToDelete && getSupplierDisplayName(supplierToDelete)}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                El proveedor se ocultará de tu lista pero podrás restaurarlo desde "Ver Archivados". Los datos históricos del Libro IVA se mantendrán intactos.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={archivingId !== null}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (supplierToDelete) {
                    try {
                      setArchivingId(supplierToDelete.id)
                      await supplierService.deleteSupplier(companyId, supplierToDelete.id)
                      setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id))
                      toast.success('Proveedor archivado')
                    } catch (error: any) {
                      toast.error(error.response?.data?.message || 'Error al archivar proveedor')
                    } finally {
                      setArchivingId(null)
                      setIsDeleteDialogOpen(false)
                      setSupplierToDelete(null)
                    }
                  }
                }}
                disabled={archivingId !== null}
              >
                {archivingId ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Archivando...
                  </>
                ) : (
                  'Archivar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
