"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { companyService, CreateCompanyData } from "@/services/company.service"
import { formatCUIT, formatPhone, formatCBU } from "@/lib/input-formatters"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormFooterLink } from "@/components/ui/form-footer-link"
import Image from "next/image"
import Link from "next/link"

export default function CreateCompanyForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
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
    city: '',
    street: '',
    street_number: '',
    floor: '',
    apartment: '',
  })
  const [confirmDeletionCode, setConfirmDeletionCode] = useState('')
  const [showDeletionCode, setShowDeletionCode] = useState(false)
  const [showConfirmDeletionCode, setShowConfirmDeletionCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bankAccount, setBankAccount] = useState({
    bank_name: '',
    account_type: 'corriente' as 'corriente' | 'caja_ahorro' | 'cuenta_sueldo',
    cbu: '',
    alias: '',
  })

  const totalSteps = 4

  const provinces = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
  ]

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error('El nombre/razón social es obligatorio')
        return
      }
      if (!formData.national_id.trim()) {
        toast.error('El CUIT/CUIL es obligatorio')
        return
      }
      if (formData.national_id.length !== 13) {
        toast.error('El CUIT/CUIL debe tener 11 dígitos')
        return
      }
    }

    if (step === 2) {
      if (!formData.province || !formData.city || !formData.postal_code || !formData.street || !formData.street_number) {
        toast.error('Completa todos los campos de dirección obligatorios')
        return
      }
    }

    if (step === 3) {
      if (!formData.deletion_code.trim()) {
        toast.error('El código de eliminación es obligatorio')
        return
      }
      if (formData.deletion_code.length < 8) {
        toast.error('El código debe tener al menos 8 caracteres')
        return
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
      if (!passwordRegex.test(formData.deletion_code)) {
        toast.error('El código debe incluir mayúsculas, minúsculas, números y caracteres especiales')
        return
      }
      if (formData.deletion_code !== confirmDeletionCode) {
        toast.error('Los códigos de eliminación no coinciden')
        return
      }
    }

    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const hasBankData = bankAccount.bank_name.trim() || bankAccount.cbu.trim()
    if (hasBankData) {
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

      if (hasBankData && company.id) {
        try {
          const { bankAccountService } = await import('@/services/bank-account.service')
          await bankAccountService.createBankAccount(company.id, bankAccount)
        } catch (bankError) {
          console.error('Error al crear cuenta bancaria:', bankError)
        }
      }

      // Recargar empresas en el sidebar y seleccionar la nueva
      if (typeof window !== 'undefined' && (window as any).reloadCompanies) {
        await (window as any).reloadCompanies(company.id)
      }

      toast.success(`Empresa "${formData.name}" creada exitosamente`)
      
      // Navegar sin recargar la página
      router.push(`/company/${company.id}`)
    } catch (error: any) {
      console.error('Error al crear empresa:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear la empresa'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Logo */}
      <div className="text-center">
        <Link href="/dashboard" className="inline-block">
          <Image
            src="/brand/payto.png"
            alt="PayTo Logo"
            width={160}
            height={160}
            className="object-contain hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              s === step ? 'bg-blue-600 text-white' :
              s < step ? 'bg-blue-100 text-blue-600' :
              'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`w-12 h-0.5 transition-colors ${
              s < step ? 'bg-blue-600' : 'bg-gray-200'
            }`} />}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">
          {step === 1 && 'Datos de la Empresa'}
          {step === 2 && 'Dirección Fiscal'}
          {step === 3 && 'Código de Seguridad'}
          {step === 4 && 'Cuenta Bancaria (Opcional)'}
        </h2>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <form className="space-y-6" onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {/* Step 1: Datos de la Empresa */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre/Razón Social *</Label>
                <Input
                  id="name"
                  placeholder="Ej: TechCorp SA, Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value.slice(0, 100)})}
                  maxLength={100}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalId">CUIT/CUIL *</Label>
                <Input
                  id="nationalId"
                  placeholder="20-12345678-9"
                  value={formData.national_id}
                  onChange={(e) => setFormData({...formData, national_id: formatCUIT(e.target.value)})}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Formato: XX-XXXXXXXX-X (11 dígitos)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="11 1234-5678"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: formatPhone(e.target.value)})}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Razón Social Completa</Label>
                  <Input
                    id="businessName"
                    placeholder="Opcional"
                    value={formData.business_name || ''}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value.slice(0, 150)})}
                    maxLength={150}
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dirección */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Provincia *</Label>
                  <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((prov) => (
                        <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    placeholder="Buenos Aires"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({...formData, city: e.target.value.slice(0, 100)})}
                    maxLength={100}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Código Postal *</Label>
                  <Input
                    id="postalCode"
                    placeholder="1414"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value.slice(0, 10)})}
                    maxLength={10}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="street">Calle *</Label>
                  <Input
                    id="street"
                    placeholder="Av. Corrientes"
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value.slice(0, 100)})}
                    maxLength={100}
                    className="h-12"
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
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Piso</Label>
                  <Input
                    id="floor"
                    placeholder="Opcional"
                    value={formData.floor || ''}
                    onChange={(e) => setFormData({...formData, floor: e.target.value.slice(0, 5)})}
                    maxLength={5}
                    className="h-12"
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
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Código de Seguridad */}
          {step === 3 && (
            <div className="space-y-4">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  Este código será necesario para eliminar la empresa. Guardalo en un lugar seguro.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="deletionCode">Código de Eliminación *</Label>
                <div className="relative">
                  <Input
                    id="deletionCode"
                    type={showDeletionCode ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.deletion_code}
                    onChange={(e) => setFormData({...formData, deletion_code: e.target.value})}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletionCode(!showDeletionCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showDeletionCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Debe incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*#?&)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmDeletionCode">Confirmar Código *</Label>
                <div className="relative">
                  <Input
                    id="confirmDeletionCode"
                    type={showConfirmDeletionCode ? "text" : "password"}
                    placeholder="Repetir código"
                    value={confirmDeletionCode}
                    onChange={(e) => setConfirmDeletionCode(e.target.value)}
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmDeletionCode(!showConfirmDeletionCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmDeletionCode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Cuenta Bancaria (Opcional) */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Banco</Label>
                  <Input
                    id="bankName"
                    placeholder="Banco Santander"
                    value={bankAccount.bank_name}
                    onChange={(e) => setBankAccount({...bankAccount, bank_name: e.target.value.slice(0, 50)})}
                    maxLength={50}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Tipo de Cuenta</Label>
                  <Select
                    value={bankAccount.account_type}
                    onValueChange={(value: any) => setBankAccount({...bankAccount, account_type: value})}
                  >
                    <SelectTrigger className="h-12">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cbu">CBU (22 dígitos)</Label>
                  <Input
                    id="cbu"
                    placeholder="0170001540000001234567"
                    value={bankAccount.cbu}
                    onChange={(e) => setBankAccount({...bankAccount, cbu: formatCBU(e.target.value)})}
                    maxLength={22}
                    className="h-12"
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
                    className="h-12"
                  />
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Importante:</strong> Después de crear la empresa, deberás subir tu certificado digital AFIP (.pfx) para habilitar la facturación electrónica y sincronizar automáticamente tu condición frente al IVA desde el Padrón de AFIP.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 text-base"
                disabled={isLoading}
              >
                Atrás
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? "Creando..." : step === totalSteps ? "Crear Empresa" : "Siguiente"}
            </Button>
          </div>
        </form>

        <FormFooterLink
          text="¿Ya tenés una empresa?"
          linkText="Unirse como miembro"
          href="/join-company"
        />
      </div>
    </div>
  )
}
