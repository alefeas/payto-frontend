"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Settings, Building2, FileText, Shield, Bell, Trash2, Download, Upload, Key, Plus, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface CompanySettings {
  // Información básica (campos de BD)
  nombre: string
  razonSocial: string
  cuitCuil: string
  email: string
  telefono: string
  direccion: string
  logoUrl: string
  
  // Configuración fiscal
  taxRegime: string
  currency: string
  
  // Configuración de facturación
  invoicePrefix: string
  nextInvoiceNumber: number
  paymentTerms: number
  
  // Impuestos predeterminados
  defaultIVA: number
  defaultIIBB: number
  
  // Retenciones predeterminadas
  defaultGanancias: number
  defaultIIBBRet: number
  defaultSUSS: number
  
  // Notificaciones
  emailNotifications: boolean
  paymentReminders: boolean
  invoiceApprovals: boolean
  
  // Seguridad
  requireTwoFactor: boolean
  sessionTimeout: number
  
  // Códigos de invitación
  inviteCode: string
  autoGenerateInvites: boolean
  
  // Estado
  activa: boolean
}

const mockSettings: CompanySettings = {
  nombre: "TechCorp",
  razonSocial: "TechCorp Sociedad Anónima",
  cuitCuil: "30-12345678-9",
  email: "contacto@techcorp.com",
  telefono: "+54 11 1234-5678",
  direccion: "Av. Corrientes 1234, CABA, Argentina",
  logoUrl: "https://techcorp.com/logo.png",
  taxRegime: "Responsable Inscripto",
  currency: "ARS",
  invoicePrefix: "FC-001",
  nextInvoiceNumber: 126,
  paymentTerms: 30,
  defaultIVA: 21.00,
  defaultIIBB: 2.50,
  defaultGanancias: 2.00,
  defaultIIBBRet: 0.42,
  defaultSUSS: 1.00,
  emailNotifications: true,
  paymentReminders: true,
  invoiceApprovals: false,
  requireTwoFactor: false,
  sessionTimeout: 60,
  inviteCode: "TC8X9K2L",
  autoGenerateInvites: true,
  activa: true
}

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [settings, setSettings] = useState<CompanySettings>(mockSettings)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [deleteCode, setDeleteCode] = useState("")
  
  // Mock deletion code - en producción vendría de la base de datos
  const companyDeletionCode = "DELETE-2024"

  // Simular rol del usuario actual
  const currentUserRole = "Administrador"

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (currentUserRole !== "Administrador") {
      router.push(`/company/${companyId}`)
      toast.error('Acceso denegado', {
        description: 'Solo los administradores pueden acceder a la configuración'
      })
    }
  }, [currentUserRole, router, companyId])

  const updateSetting = (key: keyof CompanySettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    // Aquí iría la llamada a la API
    toast.success('Configuración guardada', {
      description: 'Los cambios se aplicaron correctamente'
    })
    setHasChanges(false)
  }

  const regenerateInviteCode = () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    updateSetting('inviteCode', newCode)
    toast.success('Código regenerado', {
      description: `Nuevo código: ${newCode}`
    })
    setShowRegenerateModal(false)
  }

  const exportData = () => {
    toast.success('Exportación iniciada', {
      description: 'Recibirás un email con el archivo de datos'
    })
  }

  const deleteCompany = () => {
    if (deleteCode !== companyDeletionCode) {
      toast.error('Código incorrecto', {
        description: 'El código de eliminación no es válido'
      })
      return
    }
    
    toast.success('Empresa eliminada', {
      description: 'Todos los datos han sido eliminados permanentemente'
    })
    router.push('/dashboard')
  }

  if (authLoading) return null
  if (!isAuthenticated) return null
  if (currentUserRole !== "Administrador") return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Configuración de Empresa</h1>
              <p className="text-muted-foreground">Gestionar configuración y preferencias</p>
            </div>
          </div>
          
          {hasChanges && (
            <Button onClick={saveSettings}>
              Guardar Cambios
            </Button>
          )}
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="banking">Cuentas</TabsTrigger>
            <TabsTrigger value="billing">Facturación</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            <TabsTrigger value="advanced">Avanzado</TabsTrigger>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la Empresa</Label>
                    <Input
                      id="nombre"
                      value={settings.nombre}
                      onChange={(e) => updateSetting('nombre', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="razonSocial">Razón Social</Label>
                    <Input
                      id="razonSocial"
                      value={settings.razonSocial}
                      onChange={(e) => updateSetting('razonSocial', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cuitCuil">CUIT/CUIL</Label>
                  <Input
                    id="cuitCuil"
                    value={settings.cuitCuil}
                    onChange={(e) => updateSetting('cuitCuil', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Contacto</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSetting('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo de la Empresa</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setLogoFile(e.target.files?.[0] || null)
                          setHasChanges(true)
                        }}
                        className="flex-1"
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {logoFile && (
                      <p className="text-sm text-muted-foreground">
                        Archivo: {logoFile.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={settings.telefono}
                      onChange={(e) => updateSetting('telefono', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRegime">Régimen Fiscal</Label>
                    <Select value={settings.taxRegime} onValueChange={(value) => updateSetting('taxRegime', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                        <SelectItem value="Monotributo">Monotributo</SelectItem>
                        <SelectItem value="Exento">Exento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={settings.direccion}
                    onChange={(e) => updateSetting('direccion', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking */}
          <TabsContent value="banking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Cuentas Bancarias
                </CardTitle>
                <CardDescription>
                  Gestionar cuentas bancarias para recibir pagos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Cuenta Principal</h4>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Cuenta
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mainBankName">Banco</Label>
                        <Input
                          id="mainBankName"
                          placeholder="Banco Santander"
                          defaultValue="Banco Santander"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mainAccountType">Tipo de Cuenta</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="corriente">Cuenta Corriente</option>
                          <option value="caja_ahorro">Caja de Ahorro</option>
                          <option value="cuenta_sueldo">Cuenta Sueldo</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="mainCbu">CBU</Label>
                        <Input
                          id="mainCbu"
                          placeholder="0170001540000001234567"
                          defaultValue="0170001540000001234567"
                          maxLength={22}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mainAlias">Alias</Label>
                        <Input
                          id="mainAlias"
                          placeholder="MI.EMPRESA.MP"
                          defaultValue="TECHCORP.SA.MP"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Cuenta Principal</Badge>
                        <Badge variant="outline">Activa</Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Editar
                      </Button>
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
                  Parámetros para la generación de facturas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Prefijo de Factura</Label>
                    <Input
                      id="invoicePrefix"
                      value={settings.invoicePrefix}
                      onChange={(e) => updateSetting('invoicePrefix', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextInvoiceNumber">Próximo Número</Label>
                    <Input
                      id="nextInvoiceNumber"
                      type="number"
                      value={settings.nextInvoiceNumber}
                      onChange={(e) => updateSetting('nextInvoiceNumber', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                        <SelectItem value="USD">Dólar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Términos de Pago (días)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    value={settings.paymentTerms}
                    onChange={(e) => updateSetting('paymentTerms', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Impuestos Predeterminados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultIVA">IVA por Defecto (%)</Label>
                      <Input
                        id="defaultIVA"
                        type="number"
                        step="0.01"
                        value={settings.defaultIVA}
                        onChange={(e) => updateSetting('defaultIVA', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultIIBB">IIBB por Defecto (%)</Label>
                      <Input
                        id="defaultIIBB"
                        type="number"
                        step="0.01"
                        value={settings.defaultIIBB}
                        onChange={(e) => updateSetting('defaultIIBB', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Estos valores se aplicarán automáticamente al crear facturas, pero pueden modificarse manualmente
                  </p>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Retenciones Predeterminadas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultGanancias">Retención Ganancias (%)</Label>
                      <Input
                        id="defaultGanancias"
                        type="number"
                        step="0.01"
                        value={settings.defaultGanancias}
                        onChange={(e) => updateSetting('defaultGanancias', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultIIBBRet">Retención IIBB (%)</Label>
                      <Input
                        id="defaultIIBBRet"
                        type="number"
                        step="0.01"
                        value={settings.defaultIIBBRet}
                        onChange={(e) => updateSetting('defaultIIBBRet', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultSUSS">Retención SUSS (%)</Label>
                      <Input
                        id="defaultSUSS"
                        type="number"
                        step="0.01"
                        value={settings.defaultSUSS}
                        onChange={(e) => updateSetting('defaultSUSS', parseFloat(e.target.value))}
                      />
                    </div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones importantes por email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recordatorios de Pago</Label>
                    <p className="text-sm text-muted-foreground">Enviar recordatorios automáticos a clientes</p>
                  </div>
                  <Switch
                    checked={settings.paymentReminders}
                    onCheckedChange={(checked) => updateSetting('paymentReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones de Aprobación</Label>
                    <p className="text-sm text-muted-foreground">Alertar cuando se requiera aprobación de facturas</p>
                  </div>
                  <Switch
                    checked={settings.invoiceApprovals}
                    onCheckedChange={(checked) => updateSetting('invoiceApprovals', checked)}
                  />
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
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">Requerir 2FA para todos los usuarios</p>
                  </div>
                  <Switch
                    checked={settings.requireTwoFactor}
                    onCheckedChange={(checked) => updateSetting('requireTwoFactor', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label>Código de Invitación</Label>
                  <div className="flex items-center gap-2">
                    <Input value={settings.inviteCode} readOnly />
                    <Button variant="outline" onClick={() => setShowRegenerateModal(true)}>
                      <Key className="h-4 w-4 mr-2" />
                      Regenerar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Los nuevos miembros necesitan este código para unirse
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración Avanzada
                </CardTitle>
                <CardDescription>
                  Opciones avanzadas y gestión de datos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Exportar Datos</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Descargar todos los datos de la empresa en formato JSON
                  </p>
                  <Button variant="outline" onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Datos
                  </Button>
                </div>
                
                <div className="border-t pt-6">
                  <Label className="text-red-600">Zona de Peligro</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Estas acciones son irreversibles y eliminarán permanentemente todos los datos
                  </p>
                  <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Empresa
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
              <DialogTitle>Eliminar Empresa</DialogTitle>
              <DialogDescription>
                Esta acción eliminará permanentemente la empresa y todos sus datos asociados. 
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