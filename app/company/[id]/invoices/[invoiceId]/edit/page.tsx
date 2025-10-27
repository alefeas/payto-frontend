"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { invoiceService } from "@/services/invoice.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function EditSyncedInvoicePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  const invoiceId = params.invoiceId as string

  const [invoice, setInvoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    concept: 'products',
    service_date_from: '',
    service_date_to: '',
    items: [] as Array<{ description: string }>
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const loadInvoice = async () => {
      if (!companyId || !invoiceId) return
      
      setIsLoading(true)
      try {
        const data = await invoiceService.getInvoice(companyId, invoiceId)
        
        if (!data.synced_from_afip) {
          toast.error('Solo se pueden editar facturas sincronizadas desde AFIP')
          router.push(`/company/${companyId}/invoices/${invoiceId}`)
          return
        }
        
        setInvoice(data)
        setFormData({
          concept: data.concept || 'products',
          service_date_from: data.service_date_from || '',
          service_date_to: data.service_date_to || '',
          items: data.items?.map((item: any) => ({ description: item.description })) || []
        })
      } catch (error: any) {
        toast.error('Error al cargar factura')
        router.push(`/company/${companyId}/invoices`)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && companyId && invoiceId) {
      loadInvoice()
    }
  }, [isAuthenticated, companyId, invoiceId, router])

  const handleSave = async () => {
    if (formData.concept === 'services' || formData.concept === 'products_services') {
      if (!formData.service_date_from || !formData.service_date_to) {
        toast.error('Las fechas de servicio son obligatorias para servicios')
        return
      }
    }

    if (formData.items.some(item => !item.description.trim())) {
      toast.error('Todos los items deben tener descripción')
      return
    }

    setIsSaving(true)
    try {
      await invoiceService.updateSyncedInvoice(companyId, invoiceId, formData)
      toast.success('Factura actualizada correctamente')
      router.push(`/company/${companyId}/invoices/${invoiceId}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar factura')
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) return null
  if (!isAuthenticated || !invoice) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Factura {invoice.number}</h1>
            <p className="text-muted-foreground">Completar datos no disponibles en AFIP</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Concepto y Fechas de Servicio</CardTitle>
            <CardDescription>
              AFIP no proporciona estos datos, debes completarlos manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Concepto *</Label>
              <Select 
                value={formData.concept} 
                onValueChange={(value) => setFormData({...formData, concept: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Productos</SelectItem>
                  <SelectItem value="services">Servicios</SelectItem>
                  <SelectItem value="products_services">Productos y Servicios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.concept === 'services' || formData.concept === 'products_services') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Inicio Servicio *</Label>
                  <Input
                    type="date"
                    value={formData.service_date_from}
                    onChange={(e) => setFormData({...formData, service_date_from: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin Servicio *</Label>
                  <Input
                    type="date"
                    value={formData.service_date_to}
                    min={formData.service_date_from}
                    onChange={(e) => setFormData({...formData, service_date_to: e.target.value})}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descripción de Items</CardTitle>
            <CardDescription>
              AFIP solo devuelve totales, actualiza las descripciones de los items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="space-y-2">
                <Label>Item {index + 1} *</Label>
                <Input
                  value={item.description}
                  onChange={(e) => {
                    const newItems = [...formData.items]
                    newItems[index].description = e.target.value
                    setFormData({...formData, items: newItems})
                  }}
                  maxLength={200}
                  placeholder="Descripción del producto o servicio"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
