"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { companyService, CreateCompanyData } from "@/services/company.service"

export default function CreateCompanyPage() {
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: '',
    business_name: '',
    national_id: '',
    phone: '',
    tax_condition: 'RI',
    default_sales_point: 1,
    deletion_code: '',
    province: '',
    postal_code: '',
    street: '',
    street_number: '',
    floor: '',
    apartment: '',
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
    
    if (!formData.name.trim()) {
      toast.error('El nombre/razón social es obligatorio')
      return
    }
    
    if (!formData.national_id.trim()) {
      toast.error('El CUIT/CUIL/DNI es obligatorio')
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

    setIsLoading(true)
    
    try {
      await companyService.createCompany(formData)
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
              Completa tus datos fiscales. Si sos consumidor final, podrás recibir facturas pero no emitirlas.
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
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">CUIT/CUIL/DNI *</Label>
                    <Input
                      id="nationalId"
                      placeholder="30-12345678-9 o 12345678"
                      value={formData.national_id}
                      onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (Opcional)</Label>
                    <Input
                      id="phone"
                      placeholder="+54 11 1234-5678"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Razón Social Completa (Opcional)</Label>
                  <Input
                    id="businessName"
                    placeholder="Ej: TechCorp Sociedad Anónima"
                    value={formData.business_name || ''}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Configuración Fiscal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxCondition">Condición Fiscal *</Label>
                    <select
                      id="taxCondition"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.tax_condition}
                      onChange={(e) => setFormData({...formData, tax_condition: e.target.value})}
                    >
                      <option value="RI">Responsable Inscripto</option>
                      <option value="Monotributo">Monotributo</option>
                      <option value="CF">Consumidor Final</option>
                      <option value="Exento">Exento</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultSalesPoint">Punto de Venta *</Label>
                    <Input
                      id="defaultSalesPoint"
                      type="number"
                      min="1"
                      max="9999"
                      value={formData.default_sales_point}
                      onChange={(e) => setFormData({...formData, default_sales_point: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-medium">Dirección</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Provincia *</Label>
                    <select
                      id="province"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                    >
                      <option value="">Seleccionar provincia</option>
                      <option value="buenos_aires">Buenos Aires</option>
                      <option value="caba">CABA</option>
                      <option value="cordoba">Córdoba</option>
                      <option value="santa_fe">Santa Fe</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Código Postal *</Label>
                    <Input
                      id="postalCode"
                      placeholder="1414"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, street: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="streetNumber">Número *</Label>
                    <Input
                      id="streetNumber"
                      placeholder="1234"
                      value={formData.street_number}
                      onChange={(e) => setFormData({...formData, street_number: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Departamento</Label>
                    <Input
                      id="apartment"
                      placeholder="Opcional"
                      value={formData.apartment || ''}
                      onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                    />
                  </div>
                </div>
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

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
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
