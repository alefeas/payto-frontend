"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Search, Plus, Edit, Trash2, FileText, Mail, Phone, Building2, AlertTriangle, Loader2, Archive, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { supplierService, Supplier } from "@/services/supplier.service"
import { SupplierForm } from "@/components/suppliers/SupplierForm"

const condicionIvaLabels: Record<string, string> = {
  registered_taxpayer: "Responsable Inscripto",
  monotax: "Monotributo",
  exempt: "Exento"
}

const condicionIvaColors: Record<string, string> = {
  registered_taxpayer: "bg-white text-blue-800",
  monotax: "bg-white text-green-800",
  exempt: "bg-white text-purple-800"
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
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
      await supplierService.restoreSupplier(companyId, parseInt(supplierId))
      toast.success('Proveedor restaurado')
      loadArchivedSuppliers()
      loadSuppliers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restaurar proveedor')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Mis Proveedores</h1>
            <p className="text-muted-foreground">Gestiona tus proveedores externos</p>
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

        <Card>
          <CardContent className="!p-2">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {showArchived ? `Proveedores Archivados (${archivedSuppliers.length})` : `Proveedores (${filteredSuppliers.length})`}
            </CardTitle>
            <CardDescription>
              {showArchived 
                ? "Proveedores archivados que pueden ser restaurados. Necesarios para el Libro IVA histórico."
                : "Lista de proveedores externos registrados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    <Card key={supplier.id} className="hover:shadow-md transition-shadow bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base truncate">{getSupplierDisplayName(supplier)}</h3>
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
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restaurar
                          </Button>
                        </div>
                      </CardContent>
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
                  <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base truncate">{getSupplierDisplayName(supplier)}</h3>
                            <Badge className={condicionIvaColors[supplier.taxCondition]}>
                              {condicionIvaLabels[supplier.taxCondition]}
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
                            className="text-orange-600 hover:text-orange-700 hover:bg-white"
                            onClick={() => {
                              setSupplierToDelete(supplier)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (supplierToDelete) {
                    try {
                      await supplierService.deleteSupplier(companyId, supplierToDelete.id)
                      setSuppliers(suppliers.filter(s => s.id !== supplierToDelete.id))
                      toast.success('Proveedor archivado')
                    } catch (error: any) {
                      toast.error(error.response?.data?.message || 'Error al archivar proveedor')
                    } finally {
                      setIsDeleteDialogOpen(false)
                      setSupplierToDelete(null)
                    }
                  }
                }}
              >
                Archivar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
