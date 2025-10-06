"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { CreateCompanyData } from "@/types"
import { toast } from "sonner"

export default function CreateCompanyPage() {
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: '',
    businessName: '',
    taxId: '',
    email: '',
    phone: '',
    logoUrl: '',
    deletionCode: '',
    taxCondition: 'Registered',
    lastInvoiceNumber: 0,
    // Structured address fields
    province: '',
    postalCode: '',
    street: '',
    streetNumber: '',
    floor: '',
    apartment: '',
    // AFIP fields
    puntoVentaDefault: 1,
    condicionIva: 'RI',
    ingresosBrutos: '',
    inicioActividades: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bankData, setBankData] = useState({
    bankName: '',
    accountType: '',
    bankId: '',
    alias: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.taxId.trim() || !formData.email.trim()) return

    setIsLoading(true)
    
    const uniqueId = 'TC' + Math.random().toString(36).substr(2, 6).toUpperCase()
    
    toast.success(`Empresa "${formData.name}" creada exitosamente`, {
      description: `ID único asignado: ${uniqueId}`,
    })
    
    setIsLoading(false)
    router.push('/dashboard')
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
              Completa tus datos fiscales. Si sos consumidor final, podrás recibir facturas pero no emitirlas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Datos Personales/Empresa</h3>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre/Razón Social *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: TechCorp SA, Juan Pérez, María López"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre de tu empresa o tu nombre completo si sos persona física
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxId">CUIT/CUIL/DNI *</Label>
                    <Input
                      id="taxId"
                      placeholder="30-12345678-9 o 12345678"
                      value={formData.taxId}
                      onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      CUIT/CUIL para empresas/monotributo, DNI para consumidor final
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Contacto *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@empresa.com o tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (Opcional)</Label>
                    <Input
                      id="phone"
                      placeholder="+54 11 1234-5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Razón Social Completa (Opcional)</Label>
                    <Input
                      id="businessName"
                      placeholder="Ej: TechCorp Sociedad Anónima"
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Solo si es diferente al nombre principal
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo/Imagen (Opcional)</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                  {logoFile && (
                    <p className="text-sm text-green-600">
                      ✓ Archivo seleccionado: {logoFile.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Logo de empresa o foto personal. Aparecerá en tus facturas.
                  </p>
                </div>
              </div>

              {/* Configuración Fiscal y AFIP */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Configuración Fiscal y AFIP</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condicionIva">Tipo de Cuenta *</Label>
                    <select
                      id="condicionIva"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.condicionIva}
                      onChange={(e) => setFormData({...formData, condicionIva: e.target.value})}
                      required
                    >
                      <option value="RI">Responsable Inscripto - Puede emitir facturas A/B/E</option>
                      <option value="Monotributo">Monotributo - Puede emitir facturas C</option>
                      <option value="CF">Consumidor Final - Solo recibe facturas (no emite)</option>
                      <option value="Exento">Exento - Consulte con su contador</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {formData.condicionIva === 'CF' 
                        ? '⚠️ Como consumidor final, podrás recibir y organizar facturas, pero no emitirlas. Podrás actualizar a Monotributo/RI más adelante.'
                        : formData.condicionIva === 'RI'
                        ? '✅ Cuenta completa: Emitir y recibir facturas tipo A, B y E'
                        : formData.condicionIva === 'Monotributo'
                        ? '✅ Cuenta completa: Emitir y recibir facturas tipo C'
                        : formData.condicionIva === 'Exento'
                        ? '⚠️ Exento de IVA: Emitirás facturas tipo E sin IVA. Requiere autorización de AFIP. Consulta con tu contador.'
                        : 'Consulte con su contador sobre las implicancias fiscales'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="puntoVentaDefault">Punto de Venta AFIP *</Label>
                    <Input
                      id="puntoVentaDefault"
                      type="number"
                      min="1"
                      max="9999"
                      placeholder="1"
                      value={formData.puntoVentaDefault}
                      onChange={(e) => setFormData({...formData, puntoVentaDefault: parseInt(e.target.value) || 1})}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Punto de venta asignado por AFIP (1-9999)
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingresosBrutos">Ingresos Brutos (IIBB)</Label>
                    <Input
                      id="ingresosBrutos"
                      placeholder="Ej: 901-123456-7"
                      value={formData.ingresosBrutos}
                      onChange={(e) => setFormData({...formData, ingresosBrutos: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Número de inscripción en Ingresos Brutos (opcional)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inicioActividades">Inicio de Actividades</Label>
                    <Input
                      id="inicioActividades"
                      type="date"
                      value={formData.inicioActividades}
                      onChange={(e) => setFormData({...formData, inicioActividades: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground">
                      Fecha de inicio de actividades ante AFIP (opcional)
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Dirección</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provincia">Provincia *</Label>
                    <select
                      id="provincia"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar provincia</option>
                      <option value="buenos_aires">Buenos Aires</option>
                      <option value="caba">Ciudad Autónoma de Buenos Aires</option>
                      <option value="catamarca">Catamarca</option>
                      <option value="chaco">Chaco</option>
                      <option value="chubut">Chubut</option>
                      <option value="cordoba">Córdoba</option>
                      <option value="corrientes">Corrientes</option>
                      <option value="entre_rios">Entre Ríos</option>
                      <option value="formosa">Formosa</option>
                      <option value="jujuy">Jujuy</option>
                      <option value="la_pampa">La Pampa</option>
                      <option value="la_rioja">La Rioja</option>
                      <option value="mendoza">Mendoza</option>
                      <option value="misiones">Misiones</option>
                      <option value="neuquen">Neuquén</option>
                      <option value="rio_negro">Río Negro</option>
                      <option value="salta">Salta</option>
                      <option value="san_juan">San Juan</option>
                      <option value="san_luis">San Luis</option>
                      <option value="santa_cruz">Santa Cruz</option>
                      <option value="santa_fe">Santa Fe</option>
                      <option value="santiago_del_estero">Santiago del Estero</option>
                      <option value="tierra_del_fuego">Tierra del Fuego</option>
                      <option value="tucuman">Tucumán</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codigoPostal">Código Postal *</Label>
                    <Input
                      id="codigoPostal"
                      placeholder="Ej: 1414"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      maxLength={8}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="calle">Calle *</Label>
                    <Input
                      id="calle"
                      placeholder="Ej: Av. Corrientes"
                      value={formData.street}
                      onChange={(e) => setFormData({...formData, street: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroCalle">Número *</Label>
                    <Input
                      id="numeroCalle"
                      placeholder="Ej: 1234"
                      value={formData.streetNumber}
                      onChange={(e) => setFormData({...formData, streetNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="piso">Piso</Label>
                    <Input
                      id="piso"
                      placeholder="Opcional"
                      value={formData.floor}
                      onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      placeholder="Opcional"
                      value={formData.apartment}
                      onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Datos Bancarios Opcionales */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Datos Bancarios (Opcional)</h3>
                  <p className="text-sm text-muted-foreground">
                    Configura una cuenta bancaria para recibir pagos. Puedes agregar más cuentas después.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Banco</Label>
                    <Input
                      id="bankName"
                      placeholder="Ej: Banco Santander"
                      value={bankData.bankName}
                      onChange={(e) => setBankData({...bankData, bankName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Tipo de Cuenta</Label>
                    <select
                      id="accountType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={bankData.accountType}
                      onChange={(e) => setBankData({...bankData, accountType: e.target.value})}
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="corriente">Cuenta Corriente</option>
                      <option value="caja_ahorro">Caja de Ahorro</option>
                      <option value="cuenta_sueldo">Cuenta Sueldo</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankId">CBU</Label>
                    <Input
                      id="bankId"
                      placeholder="0170001540000001234567"
                      maxLength={22}
                      value={bankData.bankId}
                      onChange={(e) => setBankData({...bankData, bankId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alias">Alias (Opcional)</Label>
                    <Input
                      id="alias"
                      placeholder="MI.EMPRESA.MP"
                      value={bankData.alias}
                      onChange={(e) => setBankData({...bankData, alias: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Seguridad */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Seguridad</h3>
                <div className="space-y-2">
                  <Label htmlFor="codigoEliminador">Código de Eliminación *</Label>
                  <Input
                    id="codigoEliminador"
                    type="password"
                    placeholder="Código secreto para eliminar la empresa"
                    value={formData.deletionCode}
                    onChange={(e) => setFormData({...formData, deletionCode: e.target.value})}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Este código será requerido para eliminar la empresa permanentemente. Guárdalo en un lugar seguro.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-6">
                <p className="text-xs text-blue-800">
                  <strong>💡 Info:</strong> Al registrarte obtienes automáticamente el rol de Administrador y se genera un ID único para tu perfil. Si sos Consumidor Final, podrás actualizar a Monotributo/RI cuando lo necesites.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading || !formData.name.trim() || !formData.taxId.trim() || !formData.email.trim() || !formData.deletionCode.trim()}>
                  {isLoading ? 'Creando...' : 'Crear Empresa'}
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