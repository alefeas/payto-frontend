"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { clientService, Client } from "@/services/client.service"
import { supplierService, Supplier } from "@/services/supplier.service"
import { formatCUIT, formatPhone } from "@/lib/input-formatters"
import { afipPadronService } from "@/services/afip-padron.service"
import { useAfipGuard } from "@/components/afip/afip-guard"
import { useAfipCertificate } from "@/hooks/use-afip-certificate"
import { Loader2, CheckCircle2 } from "lucide-react"

type EntityType = "client" | "supplier"
type Entity = Client | Supplier

interface EntityFormProps {
  type: EntityType
  entity?: Entity | null
  companyId: string
  onClose: () => void
  onSuccess: (createdEntity?: Entity) => void
  showBankFields?: boolean
}

export function EntityForm({ type, entity, companyId, onClose, onSuccess, showBankFields = false }: EntityFormProps) {
  const { validateAndExecute } = useAfipGuard(companyId)
  const { isVerified: hasAfipCertificate, isLoading: afipLoading } = useAfipCertificate(companyId)
  
  const form = useForm({
    defaultValues: {
      documentType: entity?.documentType || "CUIT",
      documentNumber: entity?.documentNumber || "",
      businessName: entity?.businessName || "",
      firstName: entity?.firstName || "",
      lastName: entity?.lastName || "",
      email: entity?.email || "",
      phone: entity?.phone || "",
      address: entity?.address || "",
      postalCode: (entity as any)?.postalCode || "",
      city: (entity as any)?.city || "",
      province: (entity as any)?.province || "",
      taxCondition: entity?.taxCondition || (type === "client" ? "final_consumer" : "registered_taxpayer"),
      bankName: (entity as Supplier)?.bankName || "",
      bankAccountType: (entity as Supplier)?.bankAccountType || "",
      bankAccountNumber: (entity as Supplier)?.bankAccountNumber || "",
      bankCbu: (entity as Supplier)?.bankCbu || "",
      bankAlias: (entity as Supplier)?.bankAlias || ""
    }
  })
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validated, setValidated] = useState(false)
  const taxCondition = form.watch('taxCondition')
  const documentNumber = form.watch('documentNumber')



  const entityName = type === "client" ? "Cliente" : "Proveedor"
  const entityNameLower = type === "client" ? "cliente" : "proveedor"

  const handleSubmit = async (formData: any) => {
    if (formData.taxCondition === 'final_consumer') {
      if (!formData.firstName || !formData.lastName) {
        toast.error('Nombre y Apellido son obligatorios para Consumidor Final')
        return
      }
      if (!formData.documentNumber) {
        toast.error('El DNI es obligatorio para Consumidor Final')
        return
      }
      if (formData.documentNumber.length < 7) {
        toast.error('El DNI debe tener al menos 7 dígitos')
        return
      }
    } else {
      if (!formData.businessName && (!formData.firstName || !formData.lastName)) {
        toast.error('Debes completar Razón Social o Nombre y Apellido')
        return
      }
      if (!formData.documentNumber) {
        toast.error('CUIT es obligatorio')
        return
      }
      if (!['CUIT', 'CUIL'].includes(formData.documentType)) {
        toast.error('Debe usar CUIT')
        return
      }
      if (formData.documentNumber.replace(/\D/g, '').length !== 11) {
        toast.error('El CUIT debe tener 11 dígitos')
        return
      }
    }
    
    if (formData.taxCondition !== 'final_consumer' && !formData.address) {
      toast.error('El domicilio fiscal es obligatorio')
      return
    }
    
    try {
      setSaving(true)
      const data: any = {
        document_type: formData.documentType,
        document_number: formData.documentNumber || null,
        business_name: formData.businessName || null,
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.taxCondition !== 'final_consumer' ? (formData.address || null) : null,
        postal_code: formData.postalCode || null,
        city: formData.city || null,
        province: formData.province || null,
        tax_condition: formData.taxCondition
      }

      if (showBankFields) {
        data.bank_name = formData.bankName || null
        data.bank_account_type = formData.bankAccountType || null
        data.bank_account_number = formData.bankAccountNumber || null
        data.bank_cbu = formData.bankCbu || null
        data.bank_alias = formData.bankAlias || null
      }
      
      if (entity) {
        if (type === "client") {
          await clientService.updateClient(companyId, entity.id as string, data)
        } else {
          await supplierService.updateSupplier(companyId, entity.id as number, data)
        }
        toast.success(`${entityName} actualizado`)
        onSuccess()
      } else {
        let createdEntity: Entity
        if (type === "client") {
          createdEntity = await clientService.createClient(companyId, data)
          toast.success('Cliente creado y seleccionado')
          onSuccess(createdEntity)
        } else {
          createdEntity = await supplierService.createSupplier(companyId, data)
          toast.success('Proveedor creado y seleccionado')
          onSuccess(createdEntity)
        }
      }
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Error al guardar ${entityNameLower}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.stopPropagation()
        form.handleSubmit(handleSubmit)(e)
      }} className="space-y-4">
      {taxCondition === 'final_consumer' ? (
        <FormField
          control={form.control}
          name="documentNumber"
          rules={{
            required: 'DNI es obligatorio',
            validate: (value) => value.length >= 7 || 'DNI debe tener al menos 7 dígitos'
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>DNI *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8)
                    field.onChange(value)
                    form.setValue('documentType', 'DNI')
                    setValidated(false)
                  }}
                  placeholder="7-8 dígitos"
                  maxLength={8}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={form.control}
          name="documentNumber"
          rules={{
            required: 'CUIT es obligatorio',
            validate: (value) => value.replace(/\D/g, '').length === 11 || 'CUIT debe tener 11 dígitos'
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CUIT *</FormLabel>
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        const numbers = e.target.value.replace(/\D/g, '').slice(0, 11)
                        const formatted = formatCUIT(numbers)
                        field.onChange(formatted)
                        form.setValue('documentType', 'CUIT')
                        setValidated(false)
                      }}
                      placeholder="20-12345678-9"
                    />
                  </FormControl>
                  <FormMessage />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (documentNumber.replace(/\D/g, '').length !== 11) {
                      toast.error('Ingresa un CUIT válido')
                      return
                    }

                    validateAndExecute(async () => {
                      try {
                        setValidating(true)
                        const result = await afipPadronService.searchByCuit(companyId, documentNumber)
                        
                        if (result.success && result.data) {
                          const taxConditionMap: Record<string, "registered_taxpayer" | "monotax" | "exempt" | "final_consumer"> = {
                            'responsable_inscripto': 'registered_taxpayer',
                            'monotributo': 'monotax',
                            'exento': 'exempt',
                            'consumidor_final': 'final_consumer'
                          }
                          
                          form.setValue('businessName', result.data.business_name || result.data.name || form.getValues('businessName'))
                          form.setValue('taxCondition', taxConditionMap[result.data.tax_condition] || form.getValues('taxCondition'))
                          form.setValue('address', result.data.address || form.getValues('address'))
                          setValidated(true)
                          
                          const message = result.mock_mode
                            ? 'Datos simulados cargados (modo testing)'
                            : 'Datos obtenidos de AFIP'
                          
                          toast.success(message, {
                            description: result.mock_mode
                              ? 'El servicio de padrón AFIP solo funciona con certificado de producción'
                              : undefined
                          })
                        }
                      } catch (error: any) {
                        if (error.response?.status === 400 && error.response?.data?.error?.includes('certificado')) {
                          toast.error('Configura un certificado AFIP primero', { duration: 6000 })
                        } else {
                          toast.error(error.response?.data?.error || 'Error al consultar AFIP')
                        }
                      } finally {
                        setValidating(false)
                      }
                    }, 'Certificado AFIP requerido para buscar datos en el padrón')
                  }}
                  disabled={validating || afipLoading || !hasAfipCertificate}
                  title={
                    afipLoading 
                      ? "Validando certificado AFIP..." 
                      : !hasAfipCertificate 
                        ? "Requiere certificado AFIP activo" 
                        : "Buscar datos en AFIP"
                  }
                >
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : validated ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                'Buscar AFIP'
                  )}
                </Button>
              </div>
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="taxCondition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Condición IVA *</FormLabel>
            <Select
              value={field.value}
              onValueChange={(value) => {
                const newTaxCondition = value as "registered_taxpayer" | "monotax" | "exempt" | "final_consumer"
                if ((field.value === 'final_consumer' && newTaxCondition !== 'final_consumer') ||
                    (field.value !== 'final_consumer' && newTaxCondition === 'final_consumer')) {
                  form.setValue('documentNumber', '')
                  form.setValue('documentType', newTaxCondition === 'final_consumer' ? 'DNI' : 'CUIT')
                  if (newTaxCondition === 'final_consumer') form.setValue('address', '')
                }
                field.onChange(value)
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="registered_taxpayer">Responsable Inscripto</SelectItem>
                <SelectItem value="monotax">Monotributo</SelectItem>
                <SelectItem value="exempt">Exento</SelectItem>
                {type === "client" && <SelectItem value="final_consumer">Consumidor Final</SelectItem>}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">Identificación</h3>
        
        {taxCondition !== 'final_consumer' && (
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Razón Social <span className="text-xs text-muted-foreground font-normal">(opcional si completas nombre y apellido)</span></FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 100))} maxLength={100} placeholder="Ej: Empresa S.A." />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre
                  {taxCondition === 'final_consumer' ? (
                    <span className="text-red-500 text-xs"> *</span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-normal"> (opcional si completas razón social)</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 50))} maxLength={50} placeholder="Ej: Juan" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Apellido
                  {taxCondition === 'final_consumer' ? (
                    <span className="text-red-500 text-xs"> *</span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-normal"> (opcional si completas razón social)</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 50))} maxLength={50} placeholder="Ej: Pérez" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        

      </div>

      {taxCondition !== 'final_consumer' && (
        <>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domicilio Fiscal *</FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 200))} maxLength={200} placeholder="Calle y número" />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Requerido para registros contables. AFIP obtiene automáticamente el domicilio fiscal desde su padrón al emitir comprobantes.
                </p>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-3 gap-4">
            <FormField control={form.control} name="postalCode" render={({ field }) => (
              <FormItem>
                <FormLabel>Código Postal <span className="text-xs text-muted-foreground font-normal">(opcional)</span></FormLabel>
                <FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 20))} maxLength={20} placeholder="Ej: 1425" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad <span className="text-xs text-muted-foreground font-normal">(opcional)</span></FormLabel>
                <FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 100))} maxLength={100} placeholder="Ej: Buenos Aires" /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="province" render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia <span className="text-xs text-muted-foreground font-normal">(opcional)</span></FormLabel>
                <FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 100))} maxLength={100} placeholder="Ej: CABA" /></FormControl>
              </FormItem>
            )} />
          </div>
        </>
      )}

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">Información de Contacto</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            rules={{
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email no válido'
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-xs text-muted-foreground font-normal">(opcional)</span></FormLabel>
                <FormControl>
                  <Input {...field} type="email" onChange={(e) => field.onChange(e.target.value.slice(0, 100))} maxLength={100} placeholder="ejemplo@correo.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            rules={{
              validate: (value) => !value || value.replace(/\D/g, '').length >= 8 || 'Teléfono debe tener al menos 8 dígitos'
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono <span className="text-xs text-muted-foreground font-normal">(opcional)</span></FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => field.onChange(formatPhone(e.target.value))} placeholder="11 1234-5678" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        

      </div>

      {showBankFields && (
        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Datos Bancarios (Opcional)</h3>
          
          <div className="space-y-4">
            <FormField control={form.control} name="bankCbu" render={({ field }) => (
              <FormItem>
                <FormLabel>CBU</FormLabel>
                <FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 22))} placeholder="22 dígitos" maxLength={22} /></FormControl>
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="bankAlias" render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias</FormLabel>
                  <FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 50))} placeholder="ALIAS.BANCO.PROVEEDOR" maxLength={50} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="bankName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 100))} placeholder="Nombre del banco" maxLength={100} /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="bankAccountType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cuenta</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CA">Caja de Ahorro</SelectItem>
                      <SelectItem value="CC">Cuenta Corriente</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="bankAccountNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Cuenta</FormLabel>
                  <FormControl><Input {...field} onChange={(e) => field.onChange(e.target.value.slice(0, 50))} placeholder="Número de cuenta" maxLength={50} /></FormControl>
                </FormItem>
              )} />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (entity ? 'Actualizando...' : 'Creando...') : (entity ? "Actualizar" : "Crear")}
        </Button>
      </div>
      </form>
    </Form>
  )
}
