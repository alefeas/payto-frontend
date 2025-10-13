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
  const [addingAccount, setAddingAccount] = useState(false)
  const [editingAccountLoading, setEditingAccountLoading] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
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
    last_invoice_number: 0,
    default_vat: 21,
    vat_perception: 0,
    gross_income_perception: 2.5,
    social_security_perception: 1,
    vat_retention: 0,
    income_tax_retention: 2,
    gross_income_retention: 0.42,
    social_security_retention: 0
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
        default_sales_point: companyData.defaultSalesPoint || 1,
        last_invoice_number: companyData.lastInvoiceNumber || 0,
        default_vat: companyData.defaultVat || 21,
        vat_perception: companyData.vatPerception || 0,
        gross_income_perception: companyData.grossIncomePerception || 2.5,
        social_security_perception: companyData.socialSecurityPerception || 1,
        vat_retention: companyData.vatRetention || 0,
        income_tax_retention: companyData.incomeTaxRetention || 2,
        gross_income_retention: companyData.grossIncomeRetention || 0.42,
        social_security_retention: companyData.socialSecurityRetention || 0
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
      const updatedCompany = await companyService.updateCompany(companyId, formData)
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

  const deleteCompany = async () => {
    if (!deleteCode.trim()) {
      toast.error('Ingresa el código de eliminación')
      return
    }
    try {
      await companyService.deleteCompany(companyId, deleteCode)
      toast.success('Perfil fiscal eliminado')
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

  if (authLoading || loading) return null
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

        {/* AFIP Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Configuración AFIP/ARCA</h3>
                  <p className="text-sm text-blue-700">Configura certificados para facturación electrónica oficial</p>
                </div>
              </div>
              <Button onClick={() => router.push(`/company/${companyId}/afip`)} variant="outline">
                Configurar AFIP
              </Button>
            </div>
          </CardContent>
        </Card>

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
                        <Input value={formData.national_id} onChange={(e) => setFormData({...formData, national_id: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
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
                        <Select value={formData.tax_condition} onValueChange={(value) => setFormData({...formData, tax_condition: value})}>
                          <SelectTrigger><SelectValue placeholder="Selecciona condición fiscal" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="registered_taxpayer">Responsable Inscripto</SelectItem>
                            <SelectItem value="monotax">Monotributo</SelectItem>
                            <SelectItem value="final_consumer">Consumidor Final</SelectItem>
                            <SelectItem value="exempt">Exento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Punto de Venta</Label>
                        <Input 
                          type="number" 
                          min="1" 
                          max="9999" 
                          value={formData.default_sales_point} 
                          onChange={(e) => setFormData({...formData, default_sales_point: parseInt(e.target.value) || 1})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Numeración de Facturas</h3>
                  <div className="space-y-2">
                    <Label>Último Número de Factura</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={formData.last_invoice_number} 
                      onChange={(e) => setFormData({...formData, last_invoice_number: parseInt(e.target.value) || 0})} 
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">La próxima factura será este número + 1</p>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Impuesto Predeterminado</h3>
                  <div className="space-y-2">
                    <Label>IVA (%)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="0.01"
                      value={formData.default_vat} 
                      onChange={(e) => setFormData({...formData, default_vat: parseFloat(e.target.value) || 0})} 
                      className="max-w-xs"
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Percepciones Predeterminadas (%)</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">IVA</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={formData.vat_perception} 
                        onChange={(e) => setFormData({...formData, vat_perception: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Ingresos Brutos</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={formData.gross_income_perception} 
                        onChange={(e) => setFormData({...formData, gross_income_perception: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Seguridad Social</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={formData.social_security_perception} 
                        onChange={(e) => setFormData({...formData, social_security_perception: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Retenciones Predeterminadas (%)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">IVA</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={formData.vat_retention} 
                        onChange={(e) => setFormData({...formData, vat_retention: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Ganancias</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={formData.income_tax_retention} 
                        onChange={(e) => setFormData({...formData, income_tax_retention: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Ingresos Brutos</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={formData.gross_income_retention} 
                        onChange={(e) => setFormData({...formData, gross_income_retention: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Seguridad Social</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={formData.social_security_retention} 
                        onChange={(e) => setFormData({...formData, social_security_retention: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-4">
                    <p className="text-xs text-amber-900 dark:text-amber-100">
                      Estos valores se aplicarán por defecto al crear nuevas facturas y pagos. Podrás modificarlos individualmente.
                    </p>
                  </div>
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
                      Eliminar permanentemente el perfil fiscal y todos sus datos asociados
                    </p>
                    <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
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
                <Input placeholder="Banco Santander" value={bankFormData.bank_name} onChange={(e) => setBankFormData({...bankFormData, bank_name: e.target.value})} />
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
                <Input placeholder="0170001540000001234567" value={bankFormData.cbu} onChange={(e) => setBankFormData({...bankFormData, cbu: e.target.value.replace(/\D/g, '').slice(0, 22)})} maxLength={22} />
              </div>
              <div className="space-y-2">
                <Label>Alias</Label>
                <Input placeholder="MI.EMPRESA.MP" value={bankFormData.alias} onChange={(e) => setBankFormData({...bankFormData, alias: e.target.value})} />
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
                <Input placeholder="Banco Santander" value={bankFormData.bank_name} onChange={(e) => setBankFormData({...bankFormData, bank_name: e.target.value})} />
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
                <Input placeholder="0170001540000001234567" value={bankFormData.cbu} onChange={(e) => setBankFormData({...bankFormData, cbu: e.target.value.replace(/\D/g, '').slice(0, 22)})} maxLength={22} />
              </div>
              <div className="space-y-2">
                <Label>Alias</Label>
                <Input placeholder="MI.EMPRESA.MP" value={bankFormData.alias} onChange={(e) => setBankFormData({...bankFormData, alias: e.target.value})} />
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

        {/* Delete Company Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar Perfil Fiscal</DialogTitle>
              <DialogDescription>
                Esta acción eliminará permanentemente el perfil fiscal y todos sus datos asociados. 
                No se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Se eliminarán:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Todas las facturas y pagos</li>
                  <li>Todos los miembros y sus roles</li>
                  <li>Configuraciones y preferencias</li>
                  <li>Estadísticas e informes</li>
                </ul>
              </div>
              
              <div className="border-t pt-4">
                <Label htmlFor="deleteCode">Código de Eliminación</Label>
                <Input
                  id="deleteCode"
                  type="password"
                  placeholder="Ingresa el código de eliminación"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Este código se estableció al crear la empresa
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowDeleteModal(false)
                setDeleteCode("")
              }}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteCompany}
                disabled={!deleteCode.trim()}
              >
                Eliminar Permanentemente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}