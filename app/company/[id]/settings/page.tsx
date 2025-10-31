"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Settings, Building2, FileText, Shield, Bell, Trash2, Download, Upload, Key, Plus, CreditCard, Edit, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { companyService, Company } from "@/services/company.service"
import { bankAccountService, BankAccount } from "@/services/bank-account.service"
import { hasPermission } from "@/lib/permissions"
import { CompanyRole } from "@/types"
import { formatCUIT, formatPhone, formatCBU } from "@/lib/input-formatters"
import { AfipFiscalDataButton } from "@/components/company/AfipFiscalDataButton"

const PROVINCIAS = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán"
]

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [salesPoints, setSalesPoints] = useState<any[]>([])
  const [showAddSalesPointDialog, setShowAddSalesPointDialog] = useState(false)
  const [showEditSalesPointDialog, setShowEditSalesPointDialog] = useState(false)
  const [showDeleteSalesPointDialog, setShowDeleteSalesPointDialog] = useState(false)
  const [editingSalesPoint, setEditingSalesPoint] = useState<any>(null)
  const [deletingSalesPointId, setDeletingSalesPointId] = useState<string | null>(null)
  const [salesPointFormData, setSalesPointFormData] = useState({ point_number: '', name: '' })
  const [addingSalesPoint, setAddingSalesPoint] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [showAddBankDialog, setShowAddBankDialog] = useState(false)
  const [showEditBankDialog, setShowEditBankDialog] = useState(false)
  const [showDeleteBankDialog, setShowDeleteBankDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)
  const [deleteCode, setDeleteCode] = useState("")
  const [hasInvoices, setHasInvoices] = useState<boolean | null>(null)
  const [addingAccount, setAddingAccount] = useState(false)
  const [editingAccountLoading, setEditingAccountLoading] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [maxApprovals, setMaxApprovals] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    national_id: '',
    phone: '',
    street: '',
    street_number: '',
    floor: '',
    apartment: '',
    postal_code: '',
    province: '',
    tax_condition: '',
    default_sales_point: 1,
    default_vat: 21,
    required_approvals: 0,
    is_perception_agent: false,
    auto_perceptions: [] as any[],
    is_retention_agent: false,
    auto_retentions: [] as any[]
  })
  const [bankFormData, setBankFormData] = useState({
    bank_name: '',
    account_type: 'corriente' as 'corriente' | 'caja_ahorro' | 'cuenta_sueldo',
    cbu: '',
    alias: '',
    is_primary: false
  })
  


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (initialFormData) {
      const changed = JSON.stringify(formData) !== JSON.stringify(initialFormData)
      setHasChanges(changed)
    }
  }, [formData, initialFormData])

  const loadData = async () => {
    try {
      setLoading(true)
      const [companyData, accounts] = await Promise.all([
        companyService.getCompanyById(companyId),
        bankAccountService.getBankAccounts(companyId)
      ])
      setCompany(companyData)
      setBankAccounts(accounts)
      
      // Load sales points
      try {
        const apiClient = (await import('@/lib/api-client')).default
        const spResponse = await apiClient.get(`/companies/${companyId}/sales-points`)
        setSalesPoints(spResponse.data.data || [])
      } catch (error) {
        console.error('Error loading sales points:', error)
      }
      
      // Get members count for approval validation
      try {
        const apiClient = (await import('@/lib/api-client')).default
        const membersResponse = await apiClient.get(`/companies/${companyId}/members`)
        const approvers = (membersResponse.data.data || []).filter((m: any) => 
          ['owner', 'administrator', 'financial_director', 'accountant', 'approver'].includes(m.role) && m.isActive
        )
        setMaxApprovals(Math.max(1, approvers.length))
      } catch (error) {
        console.error('Error loading members:', error)
        setMaxApprovals(10)
      }
      
      const addr = companyData.addressData || {}
      
      const initialData = {
        name: companyData.name || '',
        business_name: companyData.businessName || '',
        national_id: companyData.nationalId || '',
        phone: companyData.phone || '',
        street: addr.street || '',
        street_number: addr.streetNumber || '',
        floor: addr.floor || '',
        apartment: addr.apartment || '',
        postal_code: addr.postalCode || '',
        province: addr.province || '',
        tax_condition: companyData.taxCondition || '',
        default_sales_point: parseInt(String(companyData.defaultSalesPoint || 1)),
        default_vat: parseFloat(String(companyData.defaultVat || 21)),
        required_approvals: companyData.requiredApprovals !== undefined ? parseInt(String(companyData.requiredApprovals)) : (companyData.required_approvals !== undefined ? parseInt(String(companyData.required_approvals)) : 0),
        is_perception_agent: companyData.isPerceptionAgent || false,
        auto_perceptions: companyData.autoPerceptions || [],
        is_retention_agent: companyData.isRetentionAgent || false,
        auto_retentions: companyData.autoRetentions || []
      }
      setFormData(initialData)
      setInitialFormData(initialData)
      setHasChanges(false)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (company && company.role !== 'administrator' && company.role !== 'owner') {
      router.push(`/company/${companyId}`)
      toast.error('Acceso denegado', {
        description: 'Solo los propietarios y administradores pueden acceder a la configuración'
      })
    }
  }, [company, router, companyId])

  const saveCompany = async () => {
    try {
      setSaving(true)
      // Ensure numeric fields are sent as numbers
      const payload = {
        ...formData,
        default_sales_point: parseInt(String(formData.default_sales_point)),
        default_vat: parseFloat(String(formData.default_vat)),
        required_approvals: parseInt(String(formData.required_approvals))
      }
      const updatedCompany = await companyService.updateCompany(companyId, payload)
      setCompany(updatedCompany)
      setInitialFormData(formData)
      setHasChanges(false)
      toast.success('Configuración guardada')
    } catch (error: any) {
      console.error('Error saving company:', error)
      toast.error(error.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const regenerateInviteCode = async () => {
    try {
      const result = await companyService.regenerateInviteCode(companyId)
      if (company) {
        setCompany({...company, inviteCode: result.inviteCode})
      }
      toast.success(`Nuevo código: ${result.inviteCode}`)
      setShowRegenerateModal(false)
    } catch (error) {
      toast.error('Error al regenerar código')
    }
  }

  const checkInvoices = async () => {
    try {
      const apiClient = (await import('@/lib/api-client')).default
      const response = await apiClient.get(`/companies/${companyId}/invoices?limit=1`)
      const invoicesExist = response.data.data && response.data.data.length > 0
      setHasInvoices(invoicesExist)
    } catch (error) {
      setHasInvoices(false)
    }
  }

  const deleteCompany = async () => {
    if (!deleteCode.trim()) {
      toast.error('Ingresa el código de eliminación')
      return
    }
    try {
      await companyService.deleteCompany(companyId, deleteCode)
      const successMessage = hasInvoices 
        ? 'Perfil fiscal eliminado correctamente. Las facturas y datos contables se mantuvieron para preservar la integridad del sistema.'
        : 'Perfil fiscal eliminado correctamente.'
      toast.success(successMessage)
      router.push('/dashboard')
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Código incorrecto')
    }
  }

  const handleAddBankAccount = async () => {
    if (!bankFormData.bank_name.trim()) {
      toast.error('El nombre del banco es obligatorio')
      return
    }
    if (bankFormData.cbu.length !== 22) {
      toast.error('El CBU debe tener 22 dígitos')
      return
    }
    try {
      setAddingAccount(true)
      const newAccount = await bankAccountService.createBankAccount(companyId, bankFormData)
      toast.success('Cuenta agregada exitosamente')
      setShowAddBankDialog(false)
      resetBankForm()
      setBankAccounts([...bankAccounts, newAccount])
    } catch (error) {
      toast.error('Error al agregar cuenta')
    } finally {
      setAddingAccount(false)
    }
  }

  const handleEditBankAccount = async () => {
    if (!editingAccount) return
    if (!bankFormData.bank_name.trim()) {
      toast.error('El nombre del banco es obligatorio')
      return
    }
    if (bankFormData.cbu.length !== 22) {
      toast.error('El CBU debe tener 22 dígitos')
      return
    }
    try {
      setEditingAccountLoading(true)
      const updatedAccount = await bankAccountService.updateBankAccount(companyId, editingAccount.id, bankFormData)
      toast.success('Cuenta actualizada exitosamente')
      setShowEditBankDialog(false)
      setEditingAccount(null)
      resetBankForm()
      setBankAccounts(bankAccounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc))
    } catch (error) {
      toast.error('Error al actualizar cuenta')
    } finally {
      setEditingAccountLoading(false)
    }
  }

  const confirmDeleteBankAccount = (accountId: string) => {
    setDeletingAccountId(accountId)
    setShowDeleteBankDialog(true)
  }

  const handleDeleteBankAccount = async () => {
    if (!deletingAccountId) return
    try {
      setDeletingAccount(true)
      await bankAccountService.deleteBankAccount(companyId, deletingAccountId)
      toast.success('Cuenta eliminada')
      setShowDeleteBankDialog(false)
      setBankAccounts(bankAccounts.filter(acc => acc.id !== deletingAccountId))
      setDeletingAccountId(null)
    } catch (error) {
      toast.error('Error al eliminar cuenta')
    } finally {
      setDeletingAccount(false)
    }
  }

  const openEditBankDialog = (account: BankAccount) => {
    setEditingAccount(account)
    setBankFormData({
      bank_name: account.bankName,
      account_type: account.accountType,
      cbu: account.cbu,
      alias: account.alias || '',
      is_primary: account.isPrimary
    })
    setShowEditBankDialog(true)
  }

  const resetBankForm = () => {
    setBankFormData({
      bank_name: '',
      account_type: 'corriente',
      cbu: '',
      alias: '',
      is_primary: false
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-12 bg-muted rounded animate-pulse"></div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }
  if (!isAuthenticated || !company) return null
  if (company.role !== 'administrator' && company.role !== 'owner') return null

  const userRole = company.role as CompanyRole
  const canUpdate = hasPermission(userRole, 'company.update')
  const canManageBankAccounts = hasPermission(userRole, 'bank_accounts.create')
  const canDelete = hasPermission(userRole, 'company.delete')
  const canRegenerateInvite = hasPermission(userRole, 'company.regenerate_invite')

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Configuración de Perfil Fiscal</h1>
              <p className="text-muted-foreground">Gestionar configuración y preferencias</p>
            </div>
          </div>
          
          {canUpdate && (
            <Button onClick={saveCompany} disabled={saving || !hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
            <TabsTrigger value="bank">Cuentas Bancarias</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información de la Empresa
                </CardTitle>
                <CardDescription>
                  Datos básicos y de contacto de la empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Datos Generales</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre de la Empresa</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Razón Social</Label>
                        <Input value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>CUIT</Label>
                        <Input value={formData.national_id} readOnly disabled className="bg-gray-100 dark:bg-gray-800" />
                        <p className="text-xs text-muted-foreground">El CUIT no puede modificarse ya que está vinculado al certificado AFIP</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Dirección</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Calle</Label>
                        <Input placeholder="Av. Corrientes" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <Input placeholder="1234" value={formData.street_number} onChange={(e) => setFormData({...formData, street_number: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Piso</Label>
                        <Input placeholder="5" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Departamento</Label>
                        <Input placeholder="A" value={formData.apartment} onChange={(e) => setFormData({...formData, apartment: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Código Postal</Label>
                        <Input placeholder="1043" value={formData.postal_code} onChange={(e) => setFormData({...formData, postal_code: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Provincia</Label>
                      <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
                        <SelectTrigger><SelectValue placeholder="Selecciona una provincia" /></SelectTrigger>
                        <SelectContent>
                          {PROVINCIAS.map(prov => (
                            <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Configuración de Facturación
                </CardTitle>
                <CardDescription>
                  Parámetros para la generación de facturas electrónicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Datos Fiscales</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Condición Fiscal</Label>
                        <div className="flex gap-2">
                          <Select value={formData.tax_condition} onValueChange={(value) => setFormData({...formData, tax_condition: value})}>
                            <SelectTrigger><SelectValue placeholder="No configurada" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="registered_taxpayer">Responsable Inscripto</SelectItem>
                              <SelectItem value="monotax">Monotributo</SelectItem>
                              <SelectItem value="exempt">Exento</SelectItem>
                            </SelectContent>
                          </Select>
                          <AfipFiscalDataButton 
                            companyId={companyId}
                            onDataFetched={(taxCondition) => {
                              setFormData({...formData, tax_condition: taxCondition})
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Actualiza desde AFIP o selecciona manualmente</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Punto de Venta Predeterminado</Label>
                        <Select 
                          value={formData.default_sales_point.toString()} 
                          onValueChange={(value) => setFormData({...formData, default_sales_point: parseInt(value)})}
                          disabled={salesPoints.length === 0}
                        >
                          <SelectTrigger><SelectValue placeholder="Selecciona un punto de venta" /></SelectTrigger>
                          <SelectContent>
                            {salesPoints.map((sp) => (
                              <SelectItem key={sp.id} value={sp.point_number.toString()}>
                                {sp.point_number.toString().padStart(4, '0')}{sp.name ? ` - ${sp.name}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {salesPoints.length === 0 && (
                          <p className="text-xs text-muted-foreground">Primero agrega un punto de venta</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Puntos de Venta</h3>
                    {canUpdate && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            const apiClient = (await import('@/lib/api-client')).default
                            await apiClient.post(`/companies/${companyId}/sales-points/sync-from-afip`)
                            const spResponse = await apiClient.get(`/companies/${companyId}/sales-points`)
                            setSalesPoints(spResponse.data.data || [])
                            toast.success('Puntos de venta sincronizados con AFIP')
                          } catch (error: any) {
                            toast.error(error.response?.data?.error || 'Error al sincronizar con AFIP')
                          }
                        }}>
                          <Download className="h-4 w-4 mr-2" />
                          Sincronizar con AFIP
                        </Button>
                        <Button size="sm" onClick={() => setShowAddSalesPointDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    )}
                  </div>
                  {salesPoints.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">No hay puntos de venta configurados</p>
                      {canUpdate && (
                        <Button size="sm" className="mt-2" onClick={() => setShowAddSalesPointDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Primer Punto de Venta
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {salesPoints.map((sp) => (
                        <div key={sp.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold">{sp.point_number.toString().padStart(4, '0')}</span>
                              {sp.name && <span className="text-sm text-muted-foreground">- {sp.name}</span>}
                            </div>
                          </div>
                          {canUpdate && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => {
                                setEditingSalesPoint(sp)
                                setSalesPointFormData({ point_number: sp.point_number.toString(), name: sp.name || '' })
                                setShowEditSalesPointDialog(true)
                              }}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              {company.role === 'owner' && process.env.NEXT_PUBLIC_AFIP_ENVIRONMENT === 'homologacion' && (
                                <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700" onClick={async () => {
                                  if (!confirm(`¿Reiniciar números de comprobante del punto ${sp.point_number}?\n\nEsto eliminará TODAS las facturas de este punto de venta.\n\nEsta acción NO se puede deshacer.`)) return
                                  try {
                                    const apiClient = (await import('@/lib/api-client')).default
                                    const response = await apiClient.post(`/companies/${companyId}/sales-points/${sp.point_number}/reset-vouchers`)
                                    toast.success(`Reiniciado. ${response.data.deleted_invoices} facturas eliminadas. Próximo número: 1`)
                                    await loadData()
                                  } catch (error: any) {
                                    toast.error(error.response?.data?.error || 'Error al reiniciar')
                                  }
                                }} title="Reiniciar números (solo Homologación)">
                                  <span className="text-xs">🔄</span>
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => {
                                setDeletingSalesPointId(sp.id)
                                setShowDeleteSalesPointDialog(true)
                              }}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Aprobaciones de Facturas</h3>
                  <div className="space-y-2">
                    <Label>Aprobaciones Requeridas</Label>
                    <Select 
                      value={formData.required_approvals.toString()} 
                      onValueChange={(value) => setFormData({...formData, required_approvals: parseInt(value)})}
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin aprobación (automático)</SelectItem>
                        {Array.from({length: maxApprovals}, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} aprobación{num > 1 ? 'es' : ''} requerida{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {maxApprovals === 1 ? 'Hay 1 miembro' : `Hay ${maxApprovals} miembros`} con permiso para aprobar facturas.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
                      <p className="text-xs text-amber-900 dark:text-amber-100">
                        <strong>Importante:</strong> Al reducir el número de aprobaciones requeridas, las facturas pendientes que ya cumplan con el nuevo número se aprobarán automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">IVA Predeterminado</h3>
                  <div className="space-y-2">
                    <Label>Alícuota de IVA por defecto</Label>
                    <Select 
                      value={formData.default_vat.toString()} 
                      onValueChange={(value) => {
                        setFormData({...formData, default_vat: parseFloat(value)})
                      }}
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue>
                          {formData.default_vat === -1 ? 'Exento' : 
                           formData.default_vat === -2 ? 'No Gravado' : 
                           `${formData.default_vat}%`}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">Exento</SelectItem>
                        <SelectItem value="-2">No Gravado</SelectItem>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="2.5">2.5%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="10.5">10.5%</SelectItem>
                        <SelectItem value="21">21% (General)</SelectItem>
                        <SelectItem value="27">27%</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Este valor se aplicará por defecto al agregar ítems en facturas</p>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Agente de Percepciones</h3>
                      <p className="text-sm text-muted-foreground">Percepciones que se aplicarán automáticamente al emitir facturas</p>
                    </div>
                    <Switch 
                      checked={formData.is_perception_agent} 
                      onCheckedChange={(checked) => setFormData({...formData, is_perception_agent: checked})} 
                    />
                  </div>
                  
                  {formData.is_perception_agent && (
                    <div className="space-y-3">
                      {formData.auto_perceptions.map((perception: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newPerceptions = formData.auto_perceptions.filter((_: any, i: number) => i !== index)
                              setFormData({...formData, auto_perceptions: newPerceptions})
                            }}
                            className="absolute top-2 right-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                            <div className="space-y-2">
                              <Label>Tipo *</Label>
                              <Select
                                value={perception.type}
                                onValueChange={(value) => {
                                  const newPerceptions = [...formData.auto_perceptions]
                                  newPerceptions[index] = {...newPerceptions[index], type: value}
                                  setFormData({...formData, auto_perceptions: newPerceptions})
                                }}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  <SelectItem value="vat_perception">Percepción IVA</SelectItem>
                                  <SelectItem value="income_tax_perception">Percepción Ganancias</SelectItem>
                                  <SelectItem value="internal_taxes_perception">Impuestos Internos</SelectItem>
                                  <SelectItem value="gross_income_buenosaires">IIBB Buenos Aires</SelectItem>
                                  <SelectItem value="gross_income_caba">IIBB CABA</SelectItem>
                                  <SelectItem value="gross_income_catamarca">IIBB Catamarca</SelectItem>
                                  <SelectItem value="gross_income_chaco">IIBB Chaco</SelectItem>
                                  <SelectItem value="gross_income_chubut">IIBB Chubut</SelectItem>
                                  <SelectItem value="gross_income_cordoba">IIBB Córdoba</SelectItem>
                                  <SelectItem value="gross_income_corrientes">IIBB Corrientes</SelectItem>
                                  <SelectItem value="gross_income_entrerios">IIBB Entre Ríos</SelectItem>
                                  <SelectItem value="gross_income_formosa">IIBB Formosa</SelectItem>
                                  <SelectItem value="gross_income_jujuy">IIBB Jujuy</SelectItem>
                                  <SelectItem value="gross_income_lapampa">IIBB La Pampa</SelectItem>
                                  <SelectItem value="gross_income_larioja">IIBB La Rioja</SelectItem>
                                  <SelectItem value="gross_income_mendoza">IIBB Mendoza</SelectItem>
                                  <SelectItem value="gross_income_misiones">IIBB Misiones</SelectItem>
                                  <SelectItem value="gross_income_neuquen">IIBB Neuquén</SelectItem>
                                  <SelectItem value="gross_income_rionegro">IIBB Río Negro</SelectItem>
                                  <SelectItem value="gross_income_salta">IIBB Salta</SelectItem>
                                  <SelectItem value="gross_income_sanjuan">IIBB San Juan</SelectItem>
                                  <SelectItem value="gross_income_sanluis">IIBB San Luis</SelectItem>
                                  <SelectItem value="gross_income_santacruz">IIBB Santa Cruz</SelectItem>
                                  <SelectItem value="gross_income_santafe">IIBB Santa Fe</SelectItem>
                                  <SelectItem value="gross_income_santiagodelestero">IIBB Santiago del Estero</SelectItem>
                                  <SelectItem value="gross_income_tierradelfuego">IIBB Tierra del Fuego</SelectItem>
                                  <SelectItem value="gross_income_tucuman">IIBB Tucumán</SelectItem>
                                  <SelectItem value="other_perception">Otra Percepción</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Descripción *</Label>
                              <Input
                                placeholder="Ej: Percepción IIBB Buenos Aires"
                                value={perception.name || ''}
                                onChange={(e) => {
                                  const newPerceptions = [...formData.auto_perceptions]
                                  newPerceptions[index] = {...newPerceptions[index], name: e.target.value.slice(0, 100)}
                                  setFormData({...formData, auto_perceptions: newPerceptions})
                                }}
                                maxLength={100}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Alícuota (%) *</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="Ej: 3.5"
                                value={perception.rate}
                                onChange={(e) => {
                                  const newPerceptions = [...formData.auto_perceptions]
                                  newPerceptions[index] = {...newPerceptions[index], rate: parseFloat(e.target.value) || 0}
                                  setFormData({...formData, auto_perceptions: newPerceptions})
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Base de Cálculo *</Label>
                              <Select
                                value={perception.base_type || 'net'}
                                onValueChange={(value) => {
                                  const newPerceptions = [...formData.auto_perceptions]
                                  newPerceptions[index] = {...newPerceptions[index], base_type: value}
                                  setFormData({...formData, auto_perceptions: newPerceptions})
                                }}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="net">Neto sin IVA</SelectItem>
                                  <SelectItem value="total">Total con IVA</SelectItem>
                                  <SelectItem value="vat">Solo IVA</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button 
                        type="button" 
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            auto_perceptions: [...formData.auto_perceptions, {
                              type: 'gross_income_buenosaires',
                              name: '',
                              rate: 3,
                              base_type: 'net'
                            }]
                          })
                        }} 
                        variant="outline" 
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Percepción Automática
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Agente de Retenciones</h3>
                      <p className="text-sm text-muted-foreground">Retenciones que se aplicarán automáticamente al registrar facturas recibidas</p>
                    </div>
                    <Switch 
                      checked={formData.is_retention_agent} 
                      onCheckedChange={(checked) => setFormData({...formData, is_retention_agent: checked})} 
                    />
                  </div>
                  
                  {formData.is_retention_agent && (
                    <div className="space-y-3">
                      {formData.auto_retentions.map((retention: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newRetentions = formData.auto_retentions.filter((_: any, i: number) => i !== index)
                              setFormData({...formData, auto_retentions: newRetentions})
                            }}
                            className="absolute top-2 right-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                            <div className="space-y-2">
                              <Label>Tipo *</Label>
                              <Select
                                value={retention.type}
                                onValueChange={(value) => {
                                  const newRetentions = [...formData.auto_retentions]
                                  newRetentions[index] = {...newRetentions[index], type: value}
                                  setFormData({...formData, auto_retentions: newRetentions})
                                }}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  <SelectItem value="vat_retention">Retención IVA</SelectItem>
                                  <SelectItem value="income_tax_retention">Retención Ganancias</SelectItem>
                                  <SelectItem value="suss_retention">Retención SUSS</SelectItem>
                                  <SelectItem value="gross_income_buenosaires">Retención IIBB Buenos Aires</SelectItem>
                                  <SelectItem value="gross_income_caba">Retención IIBB CABA</SelectItem>
                                  <SelectItem value="gross_income_catamarca">Retención IIBB Catamarca</SelectItem>
                                  <SelectItem value="gross_income_chaco">Retención IIBB Chaco</SelectItem>
                                  <SelectItem value="gross_income_chubut">Retención IIBB Chubut</SelectItem>
                                  <SelectItem value="gross_income_cordoba">Retención IIBB Córdoba</SelectItem>
                                  <SelectItem value="gross_income_corrientes">Retención IIBB Corrientes</SelectItem>
                                  <SelectItem value="gross_income_entrerios">Retención IIBB Entre Ríos</SelectItem>
                                  <SelectItem value="gross_income_formosa">Retención IIBB Formosa</SelectItem>
                                  <SelectItem value="gross_income_jujuy">Retención IIBB Jujuy</SelectItem>
                                  <SelectItem value="gross_income_lapampa">Retención IIBB La Pampa</SelectItem>
                                  <SelectItem value="gross_income_larioja">Retención IIBB La Rioja</SelectItem>
                                  <SelectItem value="gross_income_mendoza">Retención IIBB Mendoza</SelectItem>
                                  <SelectItem value="gross_income_misiones">Retención IIBB Misiones</SelectItem>
                                  <SelectItem value="gross_income_neuquen">Retención IIBB Neuquén</SelectItem>
                                  <SelectItem value="gross_income_rionegro">Retención IIBB Río Negro</SelectItem>
                                  <SelectItem value="gross_income_salta">Retención IIBB Salta</SelectItem>
                                  <SelectItem value="gross_income_sanjuan">Retención IIBB San Juan</SelectItem>
                                  <SelectItem value="gross_income_sanluis">Retención IIBB San Luis</SelectItem>
                                  <SelectItem value="gross_income_santacruz">Retención IIBB Santa Cruz</SelectItem>
                                  <SelectItem value="gross_income_santafe">Retención IIBB Santa Fe</SelectItem>
                                  <SelectItem value="gross_income_santiagodelestero">Retención IIBB Santiago del Estero</SelectItem>
                                  <SelectItem value="gross_income_tierradelfuego">Retención IIBB Tierra del Fuego</SelectItem>
                                  <SelectItem value="gross_income_tucuman">Retención IIBB Tucumán</SelectItem>
                                  <SelectItem value="other">Otra Retención</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Descripción *</Label>
                              <Input
                                placeholder="Ej: Retención IIBB Buenos Aires"
                                value={retention.name || ''}
                                onChange={(e) => {
                                  const newRetentions = [...formData.auto_retentions]
                                  newRetentions[index] = {...newRetentions[index], name: e.target.value.slice(0, 100)}
                                  setFormData({...formData, auto_retentions: newRetentions})
                                }}
                                maxLength={100}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Alícuota (%) *</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="Ej: 2"
                                value={retention.rate}
                                onChange={(e) => {
                                  const newRetentions = [...formData.auto_retentions]
                                  newRetentions[index] = {...newRetentions[index], rate: parseFloat(e.target.value) || 0}
                                  setFormData({...formData, auto_retentions: newRetentions})
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Base de Cálculo *</Label>
                              <Select
                                value={retention.base_type || 'net'}
                                onValueChange={(value) => {
                                  const newRetentions = [...formData.auto_retentions]
                                  newRetentions[index] = {...newRetentions[index], base_type: value}
                                  setFormData({...formData, auto_retentions: newRetentions})
                                }}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="net">Neto sin IVA</SelectItem>
                                  <SelectItem value="total">Total con IVA</SelectItem>
                                  <SelectItem value="vat">Solo IVA</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button 
                        type="button" 
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            auto_retentions: [...formData.auto_retentions, {
                              type: 'income_tax_retention',
                              name: '',
                              rate: 2,
                              base_type: 'net'
                            }]
                          })
                        }} 
                        variant="outline" 
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Retención Automática
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configuración de Notificaciones
                </CardTitle>
                <CardDescription>
                  Gestionar alertas y recordatorios automáticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Notificaciones por Email</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Nuevas Facturas</p>
                        <p className="text-sm text-muted-foreground">Recibir notificación cuando se emite una nueva factura</p>
                      </div>
                      <Switch defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Pagos Recibidos</p>
                        <p className="text-sm text-muted-foreground">Notificar cuando se registra un pago</p>
                      </div>
                      <Switch defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Facturas Vencidas</p>
                        <p className="text-sm text-muted-foreground">Alertas sobre facturas que no han sido pagadas</p>
                      </div>
                      <Switch defaultChecked disabled />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Nuevos Miembros</p>
                        <p className="text-sm text-muted-foreground">Notificar cuando alguien se une al perfil fiscal</p>
                      </div>
                      <Switch disabled />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Recordatorios Automáticos</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Recordatorio de Vencimiento</p>
                        <p className="text-sm text-muted-foreground">Enviar recordatorio 3 días antes del vencimiento</p>
                      </div>
                      <Switch disabled />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Resumen Semanal</p>
                        <p className="text-sm text-muted-foreground">Recibir resumen de actividad cada semana</p>
                      </div>
                      <Switch disabled />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Resumen Mensual</p>
                        <p className="text-sm text-muted-foreground">Recibir informe mensual de facturación</p>
                      </div>
                      <Switch disabled />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Canales de Notificación</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email de Notificaciones</Label>
                      <Input type="email" placeholder="notificaciones@empresa.com" disabled />
                      <p className="text-xs text-muted-foreground">Email donde se enviarán las notificaciones</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Nota:</strong> Las opciones de notificaciones están deshabilitadas temporalmente. Próximamente podrás configurar todas las alertas y recordatorios.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuración de Seguridad
                </CardTitle>
                <CardDescription>
                  Proteger el acceso y los datos de la empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Código de Invitación</Label>
                  <div className="flex items-center gap-2">
                    <Input value={company?.inviteCode || ''} readOnly />
                    {canRegenerateInvite && (
                      <Button variant="outline" onClick={() => setShowRegenerateModal(true)}>
                        <Key className="h-4 w-4 mr-2" />
                        Regenerar
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Los nuevos miembros necesitan este código para unirse
                  </p>
                </div>
                
                {canDelete && (
                  <div className="border-t pt-6">
                    <Label className="text-red-600">Zona de Peligro</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Eliminar el perfil fiscal manteniendo los datos contables para preservar la integridad del sistema
                    </p>
                    <Button variant="destructive" onClick={() => {
                      setShowDeleteModal(true)
                      checkInvoices()
                    }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Perfil Fiscal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Accounts */}
          <TabsContent value="bank" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Cuentas Bancarias
                    </CardTitle>
                    <CardDescription>Gestiona las cuentas para recibir pagos</CardDescription>
                  </div>
                  {canManageBankAccounts && (
                    <Button onClick={() => setShowAddBankDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Cuenta
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {bankAccounts.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No hay cuentas bancarias</h3>
                    <p className="text-sm text-muted-foreground mb-4">Agrega una cuenta para recibir pagos</p>
                    {canManageBankAccounts && (
                      <Button onClick={() => setShowAddBankDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primera Cuenta
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {bankAccounts.map((account) => (
                      <div key={account.id} className="border rounded-lg p-4 relative">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{account.bankName}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{account.accountType.replace('_', ' ')}</p>
                          </div>
                          {canManageBankAccounts && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => openEditBankDialog(account)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => confirmDeleteBankAccount(account.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">CBU</p>
                            <p className="font-mono">{account.cbu}</p>
                          </div>
                          {account.alias && (
                            <div>
                              <p className="text-muted-foreground">Alias</p>
                              <p className="font-mono">{account.alias}</p>
                            </div>
                          )}
                        </div>
                        {account.isPrimary && (
                          <div className="absolute bottom-3 right-3">
                            <span className="text-xs font-medium bg-primary text-primary-foreground px-2.5 py-1 rounded-md shadow-sm">Principal</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Bank Account Dialog */}
        <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Cuenta Bancaria</DialogTitle>
              <DialogDescription>Completa los datos de la nueva cuenta</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Banco *</Label>
                <Input placeholder="Banco Santander" value={bankFormData.bank_name} onChange={(e) => setBankFormData({...bankFormData, bank_name: e.target.value.slice(0, 50)})} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Cuenta *</Label>
                <Select value={bankFormData.account_type} onValueChange={(value) => setBankFormData({...bankFormData, account_type: value as 'corriente' | 'caja_ahorro' | 'cuenta_sueldo'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corriente">Cuenta Corriente</SelectItem>
                    <SelectItem value="caja_ahorro">Caja de Ahorro</SelectItem>
                    <SelectItem value="cuenta_sueldo">Cuenta Sueldo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>CBU * (22 dígitos)</Label>
                <Input placeholder="0170001540000001234567" value={bankFormData.cbu} onChange={(e) => setBankFormData({...bankFormData, cbu: formatCBU(e.target.value)})} maxLength={22} />
              </div>
              <div className="space-y-2">
                <Label>Alias</Label>
                <Input placeholder="MI.EMPRESA.MP" value={bankFormData.alias} onChange={(e) => setBankFormData({...bankFormData, alias: e.target.value.toUpperCase().slice(0, 20)})} maxLength={20} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={bankFormData.is_primary} onCheckedChange={(checked) => setBankFormData({...bankFormData, is_primary: checked})} />
                <Label>Establecer como cuenta principal</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddBankDialog(false); resetBankForm(); }} disabled={addingAccount}>Cancelar</Button>
              <Button onClick={handleAddBankAccount} disabled={addingAccount}>{addingAccount ? 'Agregando...' : 'Agregar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Bank Account Dialog */}
        <Dialog open={showEditBankDialog} onOpenChange={setShowEditBankDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cuenta Bancaria</DialogTitle>
              <DialogDescription>Modifica los datos de la cuenta</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Banco *</Label>
                <Input placeholder="Banco Santander" value={bankFormData.bank_name} onChange={(e) => setBankFormData({...bankFormData, bank_name: e.target.value.slice(0, 50)})} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Cuenta *</Label>
                <Select value={bankFormData.account_type} onValueChange={(value) => setBankFormData({...bankFormData, account_type: value as 'corriente' | 'caja_ahorro' | 'cuenta_sueldo'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corriente">Cuenta Corriente</SelectItem>
                    <SelectItem value="caja_ahorro">Caja de Ahorro</SelectItem>
                    <SelectItem value="cuenta_sueldo">Cuenta Sueldo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>CBU * (22 dígitos)</Label>
                <Input placeholder="0170001540000001234567" value={bankFormData.cbu} onChange={(e) => setBankFormData({...bankFormData, cbu: formatCBU(e.target.value)})} maxLength={22} />
              </div>
              <div className="space-y-2">
                <Label>Alias</Label>
                <Input placeholder="MI.EMPRESA.MP" value={bankFormData.alias} onChange={(e) => setBankFormData({...bankFormData, alias: e.target.value.toUpperCase().slice(0, 20)})} maxLength={20} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={bankFormData.is_primary} onCheckedChange={(checked) => setBankFormData({...bankFormData, is_primary: checked})} />
                <Label>Establecer como cuenta principal</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditBankDialog(false); setEditingAccount(null); resetBankForm(); }} disabled={editingAccountLoading}>Cancelar</Button>
              <Button onClick={handleEditBankAccount} disabled={editingAccountLoading}>{editingAccountLoading ? 'Guardando...' : 'Guardar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Bank Account Dialog */}
        <Dialog open={showDeleteBankDialog} onOpenChange={setShowDeleteBankDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar cuenta bancaria?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. La cuenta será eliminada permanentemente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteBankDialog(false); setDeletingAccountId(null); }} disabled={deletingAccount}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteBankAccount} disabled={deletingAccount}>{deletingAccount ? 'Eliminando...' : 'Eliminar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Regenerate Invite Code Modal */}
        <Dialog open={showRegenerateModal} onOpenChange={setShowRegenerateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerar Código de Invitación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres generar un nuevo código? El código actual dejará de funcionar.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegenerateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={regenerateInviteCode}>
                Regenerar Código
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Sales Point Dialog */}
        <Dialog open={showAddSalesPointDialog} onOpenChange={setShowAddSalesPointDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Punto de Venta</DialogTitle>
              <DialogDescription>Configura un nuevo punto de venta para emitir facturas</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Número de Punto de Venta *</Label>
                <Input 
                  type="text" 
                  placeholder="1" 
                  value={salesPointFormData.point_number} 
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setSalesPointFormData({...salesPointFormData, point_number: value})
                  }} 
                  maxLength={4}
                />
                <p className="text-xs text-muted-foreground">Número entre 1 y 9999 (máx. 4 dígitos)</p>
              </div>
              <div className="space-y-2">
                <Label>Nombre (opcional)</Label>
                <Input 
                  placeholder="Sucursal Centro" 
                  value={salesPointFormData.name} 
                  onChange={(e) => setSalesPointFormData({...salesPointFormData, name: e.target.value.slice(0, 100)})} 
                  maxLength={100}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddSalesPointDialog(false); setSalesPointFormData({ point_number: '', name: '' }); }} disabled={addingSalesPoint}>Cancelar</Button>
              <Button onClick={async () => {
                if (!salesPointFormData.point_number) {
                  toast.error('Ingresa el número de punto de venta')
                  return
                }
                setAddingSalesPoint(true)
                try {
                  const apiClient = (await import('@/lib/api-client')).default
                  const response = await apiClient.post(`/companies/${companyId}/sales-points`, {
                    point_number: parseInt(salesPointFormData.point_number),
                    name: salesPointFormData.name || null
                  })
                  const newSalesPoint = response.data.data
                  setSalesPoints([...salesPoints, newSalesPoint])
                  if (salesPoints.length === 0) {
                    setFormData({...formData, default_sales_point: newSalesPoint.point_number})
                  }
                  toast.success('Punto de venta agregado')
                  setShowAddSalesPointDialog(false)
                  setSalesPointFormData({ point_number: '', name: '' })
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Error al agregar punto de venta')
                } finally {
                  setAddingSalesPoint(false)
                }
              }} disabled={addingSalesPoint}>{addingSalesPoint ? 'Agregando...' : 'Agregar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Sales Point Dialog */}
        <Dialog open={showEditSalesPointDialog} onOpenChange={setShowEditSalesPointDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Punto de Venta</DialogTitle>
              <DialogDescription>Modifica el nombre del punto de venta</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Número de Punto de Venta</Label>
                <Input value={salesPointFormData.point_number} readOnly disabled className="bg-gray-100 dark:bg-gray-800" />
                <p className="text-xs text-muted-foreground">El número no puede modificarse</p>
              </div>
              <div className="space-y-2">
                <Label>Nombre (opcional)</Label>
                <Input 
                  placeholder="Sucursal Centro" 
                  value={salesPointFormData.name} 
                  onChange={(e) => setSalesPointFormData({...salesPointFormData, name: e.target.value.slice(0, 100)})} 
                  maxLength={100}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditSalesPointDialog(false); setEditingSalesPoint(null); setSalesPointFormData({ point_number: '', name: '' }); }}>Cancelar</Button>
              <Button onClick={async () => {
                if (!editingSalesPoint) return
                try {
                  const apiClient = (await import('@/lib/api-client')).default
                  const response = await apiClient.put(`/companies/${companyId}/sales-points/${editingSalesPoint.id}`, {
                    name: salesPointFormData.name || null
                  })
                  const updatedSalesPoint = response.data.data
                  setSalesPoints(salesPoints.map(sp => sp.id === updatedSalesPoint.id ? updatedSalesPoint : sp))
                  toast.success('Punto de venta actualizado')
                  setShowEditSalesPointDialog(false)
                  setEditingSalesPoint(null)
                  setSalesPointFormData({ point_number: '', name: '' })
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Error al actualizar punto de venta')
                }
              }}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Sales Point Dialog */}
        <Dialog open={showDeleteSalesPointDialog} onOpenChange={setShowDeleteSalesPointDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar punto de venta?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. No podrás eliminar un punto de venta que tenga facturas asociadas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteSalesPointDialog(false); setDeletingSalesPointId(null); }}>Cancelar</Button>
              <Button variant="destructive" onClick={async () => {
                if (!deletingSalesPointId) return
                try {
                  const apiClient = (await import('@/lib/api-client')).default
                  await apiClient.delete(`/companies/${companyId}/sales-points/${deletingSalesPointId}`)
                  setSalesPoints(salesPoints.filter(sp => sp.id !== deletingSalesPointId))
                  toast.success('Punto de venta eliminado')
                  setShowDeleteSalesPointDialog(false)
                  setDeletingSalesPointId(null)
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Error al eliminar punto de venta')
                }
              }}>Eliminar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Company Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>🗑️ Eliminar Perfil Fiscal</DialogTitle>
              <DialogDescription>
                ⚠️ Esta acción es irreversible y eliminará permanentemente este perfil fiscal del sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">📋 ¿Qué se eliminará?</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>🏢 Configuración completa del perfil fiscal</li>
                  <li>👥 Todos los miembros y sus permisos</li>
                  <li>📊 Estadísticas, reportes y análisis</li>
                  <li>🔐 Certificados AFIP y configuraciones de facturación</li>
                  <li>🏦 Cuentas bancarias y métodos de pago</li>
                  <li>⚙️ Todas las preferencias y personalizaciones</li>
                </ul>
                {hasInvoices !== null && (
                  <div className={`mt-4 p-4 border rounded-lg ${
                    hasInvoices 
                      ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
                      : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  }`}>
                    <p className={`text-sm font-medium ${
                      hasInvoices 
                        ? 'text-amber-900 dark:text-amber-100'
                        : 'text-green-900 dark:text-green-100'
                    }`}>
                      {hasInvoices ? '🛡️ Protección de Datos Contables' : '✅ Sin Datos Contables'}
                    </p>
                    <p className={`text-xs mt-1 ${
                      hasInvoices 
                        ? 'text-amber-800 dark:text-amber-200'
                        : 'text-green-800 dark:text-green-200'
                    }`}>
                      {
                        hasInvoices 
                          ? 'Tranquilo: Todas las facturas, pagos y registros contables permanecerán intactos en el sistema. Esto garantiza el cumplimiento de las obligaciones fiscales y la integridad histórica de los datos financieros.'
                          : 'Esta empresa no tiene facturas ni movimientos contables registrados, por lo que la eliminación será completa sin afectar datos fiscales.'
                      }
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <Label htmlFor="deleteCode" className="flex items-center gap-2">
                  🔐 Código de Seguridad
                </Label>
                <Input
                  id="deleteCode"
                  type="password"
                  placeholder="Ingresa tu código de eliminación secreto"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Este código se configuró al crear la empresa como medida de seguridad
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowDeleteModal(false)
                setDeleteCode("")
                setHasInvoices(null)
              }}>
                🚫 Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteCompany}
                disabled={!deleteCode.trim()}
              >
                🗑️ Confirmar Eliminación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}