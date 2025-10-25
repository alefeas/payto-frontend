"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { companyService, CreateCompanyData } from "@/services/company.service"
import { formatCUIT, formatPhone, formatCBU } from "@/lib/input-formatters"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateCompanyPage() {
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: '',
    business_name: '',
    national_id: '',
    phone: '',
    default_sales_point: 1,
    last_invoice_number: 0,
    deletion_code: '',
    province: '',
    postal_code: '',
    street: '',
    street_number: '',
    floor: '',
    apartment: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [addBankAccount, setAddBankAccount] = useState(false)
  const [bankAccount, setBankAccount] = useState({
    bank_name: '',
    account_type: 'corriente' as 'corriente' | 'caja_ahorro' | 'cuenta_sueldo',
    cbu: '',
    alias: '',
  })
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre/razón social es obligatorio')
      return
    }
    
    if (!formData.national_id.trim()) {
      toast.error('El CUIT/CUIL es obligatorio')
      return
    }
    
    if (formData.national_id.length !== 13) {
      toast.error('El CUIT/CUIL debe tener 11 dígitos (formato: XX-XXXXXXXX-X)')
      return
    }
    
    if (!formData.deletion_code.trim()) {
      toast.error('El código de eliminación es obligatorio')
      return
    }
    
    if (formData.deletion_code.length < 8) {
      toast.error('El código de eliminación debe tener al menos 8 caracteres')
      return
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    if (!passwordRegex.test(formData.deletion_code)) {
      toast.error('El código debe incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*#?&)')
      return
    }
    
    if (!formData.province || !formData.postal_code || !formData.street || !formData.street_number) {
      toast.error('Por favor completa todos los campos de dirección obligatorios')
      return
    }

    if (addBankAccount) {
      if (!bankAccount.bank_name.trim()) {
        toast.error('El nombre del banco es obligatorio')
        return
      }
      if (bankAccount.cbu.length !== 22) {
        toast.error('El CBU debe tener 22 dígitos')
        return
      }
    }

    setIsLoading(true)
    
    try {
      const company = await companyService.createCompany(formData)
      
      if (addBankAccount && company.id) {
        try {
          const { bankAccountService } = await import('@/services/bank-account.service')
          await bankAccountService.createBankAccount(company.id, bankAccount)
        } catch (bankError) {
          console.error('Error al crear cuenta bancaria:', bankError)
        }
      }
      
      toast.success(`Empresa "${formData.name}" creada exitosamente`)
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la empresa')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Registrar Perfil Fiscal</h1>
            <p className="text-muted-foreground">Configura tu perfil para gestionar facturas</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Completa tus datos fiscales para gestionar facturas y pagos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datos Personales/Empresa</h3>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre/Razón Social *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: TechCorp SA, Juan Pérez, María López"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value.slice(0, 100)})}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId">CUIT/CUIL *</Label>
                  <Input
                    id="nationalId"
                    placeholder="20-12345678-9"
                    value={formData.national_id}
                    onChange={(e) => setFormData({...formData, national_id: formatCUIT(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa tu CUIT o CUIL. Formato: XX-XXXXXXXX-X (11 dígitos)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (Opcional)</Label>
                  <Input
                    id="phone"
                    placeholder="11 1234-5678"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Razón Social Completa (Opcional)</Label>
                  <Input
                    id="businessName"
                    placeholder="Ej: TechCorp Sociedad Anónima"
                    value={formData.business_name || ''}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value.slice(0, 150)})}
                    maxLength={150}
                  />
                </div>
              </div>



              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Dirección</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia *</Label>
                    <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar provincia" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="Buenos Aires">Buenos Aires</SelectItem>
                      <SelectItem value="CABA">CABA</SelectItem>
                      <SelectItem value="Catamarca">Catamarca</SelectItem>
                      <SelectItem value="Chaco">Chaco</SelectItem>
                      <SelectItem value="Chubut">Chubut</SelectItem>
                      <SelectItem value="Córdoba">Córdoba</SelectItem>
                      <SelectItem value="Corrientes">Corrientes</SelectItem>
                      <SelectItem value="Entre Ríos">Entre Ríos</SelectItem>
                      <SelectItem value="Formosa">Formosa</SelectItem>
                      <SelectItem value="Jujuy">Jujuy</SelectItem>
                      <SelectItem value="La Pampa">La Pampa</SelectItem>
                      <SelectItem value="La Rioja">La Rioja</SelectItem>
                      <SelectItem value="Mendoza">Mendoza</SelectItem>
                      <SelectItem value="Misiones">Misiones</SelectItem>
                      <SelectItem value="Neuquén">Neuquén</SelectItem>
                      <SelectItem value="Río Negro">Río Negro</SelectItem>
                      <SelectItem value="Salta">Salta</SelectItem>
                      <SelectItem value="San Juan">San Juan</SelectItem>
                      <SelectItem value="San Luis">San Luis</SelectItem>
                      <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                      <SelectItem value="Santa Fe">Santa Fe</SelectItem>
                      <SelectItem value="Santiago del Estero">Santiago del Estero</SelectItem>
                      <SelectItem value="Tierra del Fuego">Tierra del Fuego</SelectItem>
                      <SelectItem value="Tucumán">Tucumán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal *</Label>
                    <Input
                      id="postalCode"
                      placeholder="1414"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value.slice(0, 10)})}
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="street">Calle *</Label>
                    <Input
                      id="street"
                      placeholder="Av. Corrientes"
                      value={formData.street}
                      onChange={(e) => setFormData({...formData, street: e.target.value.slice(0, 100)})}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="streetNumber">Número *</Label>
                    <Input
                      id="streetNumber"
                      placeholder="1234"
                      value={formData.street_number}
                      onChange={(e) => setFormData({...formData, street_number: e.target.value.slice(0, 10)})}
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor">Piso</Label>
                    <Input
                      id="floor"
                      placeholder="Opcional"
                      value={formData.floor || ''}
                      onChange={(e) => setFormData({...formData, floor: e.target.value.slice(0, 5)})}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Departamento</Label>
                    <Input
                      id="apartment"
                      placeholder="Opcional"
                      value={formData.apartment || ''}
                      onChange={(e) => setFormData({...formData, apartment: e.target.value.slice(0, 5)})}
                      maxLength={5}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Cuenta Bancaria (Opcional)</h3>
                    <p className="text-sm text-muted-foreground">Podés agregar una cuenta ahora o más tarde desde configuración</p>
                  </div>
                  <Switch
                    checked={addBankAccount}
                    onCheckedChange={setAddBankAccount}
                  />
                </div>
                
                {addBankAccount && (
                  <div className="space-y-4 pl-4 border-l-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Banco *</Label>
                        <Input
                          id="bankName"
                          placeholder="Banco Santander"
                          value={bankAccount.bank_name}
                          onChange={(e) => setBankAccount({...bankAccount, bank_name: e.target.value.slice(0, 50)})}
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountType">Tipo de Cuenta *</Label>
                        <Select
                          value={bankAccount.account_type}
                          onValueChange={(value: any) => setBankAccount({...bankAccount, account_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corriente">Cuenta Corriente</SelectItem>
                            <SelectItem value="caja_ahorro">Caja de Ahorro</SelectItem>
                            <SelectItem value="cuenta_sueldo">Cuenta Sueldo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cbu">CBU * (22 dígitos)</Label>
                        <Input
                          id="cbu"
                          placeholder="0170001540000001234567"
                          value={bankAccount.cbu}
                          onChange={(e) => setBankAccount({...bankAccount, cbu: formatCBU(e.target.value)})}
                          maxLength={22}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alias">Alias</Label>
                        <Input
                          id="alias"
                          placeholder="MI.EMPRESA.MP"
                          value={bankAccount.alias}
                          onChange={(e) => setBankAccount({...bankAccount, alias: e.target.value.toUpperCase().slice(0, 20)})}
                          maxLength={20}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Seguridad</h3>
                <div className="space-y-2">
                  <Label htmlFor="deletionCode">Código de Eliminación *</Label>
                  <Input
                    id="deletionCode"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.deletion_code}
                    onChange={(e) => setFormData({...formData, deletion_code: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Debe incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*#?&). Requerido para eliminar la empresa.
                  </p>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong className="block mb-1">📋 Próximo paso: Subir certificado AFIP (OBLIGATORIO)</strong>
                  Después de crear tu perfil, <strong>DEBES subir tu certificado digital de AFIP</strong> para poder emitir facturas.
                  El certificado permite:
                  <ul className="list-disc list-inside mt-2 ml-2">
                    <li>Obtener automáticamente tu condición fiscal desde AFIP</li>
                    <li>Emitir facturas electrónicas oficiales con CAE válido</li>
                    <li>Acceder a todas las funciones del sistema</li>
                  </ul>
                  <br />
                  <strong className="text-red-600">⚠️ Sin certificado AFIP no podrás emitir facturas.</strong>
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creando...' : 'Crear Perfil Fiscal'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
