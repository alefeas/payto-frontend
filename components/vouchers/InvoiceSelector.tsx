"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, AlertCircle } from "lucide-react"
import { voucherService } from "@/services/voucher.service"

interface Invoice {
  id: string
  invoice_number: string
  invoice_type: string
  sales_point?: number
  client_name: string
  total_amount: number
  available_balance: number
  issue_date: string
  concept?: string
  service_date_from?: string
  service_date_to?: string
}

interface InvoiceSelectorProps {
  companyId: string
  voucherType: string
  onSelect: (invoice: Invoice | null) => void
  disabled?: boolean
}

export function InvoiceSelector({ 
  companyId, 
  voucherType, 
  onSelect,
  disabled = false 
}: InvoiceSelectorProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInvoices = async () => {
      if (!voucherType) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const data = await voucherService.getCompatibleInvoices(companyId, voucherType)
        setInvoices(data)
        
        if (data.length === 0) {
          setError("No hay facturas compatibles para este tipo de comprobante")
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar facturas")
        setInvoices([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInvoices()
  }, [companyId, voucherType])

  const handleSelect = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    const invoice = invoices.find(inv => inv.id === invoiceId)
    onSelect(invoice || null)
  }

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invoice">Factura a Asociar *</Label>
        <Select 
          value={selectedInvoiceId} 
          onValueChange={handleSelect} 
          disabled={disabled || isLoading || invoices.length === 0}
        >
          <SelectTrigger id="invoice">
            <SelectValue placeholder={
              isLoading ? "Cargando facturas..." : 
              invoices.length === 0 ? "No hay facturas disponibles" :
              "Seleccione una factura"
            } />
          </SelectTrigger>
          <SelectContent>
            {invoices.map((invoice) => {
              const conceptLabel = invoice.concept === 'services' ? 'Servicios' : 
                                   invoice.concept === 'products_services' ? 'Productos y Servicios' : 'Productos'
              return (
              <SelectItem key={invoice.id} value={invoice.id}>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <span className="font-medium">
                      {invoice.invoice_type} {invoice.invoice_number}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {invoice.client_name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Concepto: {conceptLabel}</span>
                    <span>•</span>
                    <span>Saldo: ${invoice.available_balance.toLocaleString('es-AR')} de ${invoice.total_amount.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cargando facturas compatibles...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <div className="flex-1">
            <span className="text-sm text-yellow-800">{error}</span>
            <p className="text-xs text-yellow-700 mt-1">
              Debe emitir primero una factura del tipo compatible para poder crear este comprobante.
            </p>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Factura:</span>
                <span className="font-medium">{selectedInvoice.invoice_type} {selectedInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{selectedInvoice.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concepto:</span>
                <span className="font-medium">
                  {selectedInvoice.concept === 'services' ? 'Servicios' : 
                   selectedInvoice.concept === 'products_services' ? 'Productos y Servicios' : 'Productos'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha Emisión:</span>
                <span>{new Date(selectedInvoice.issue_date).toLocaleDateString('es-AR')}</span>
              </div>
              {(selectedInvoice.concept === 'services' || selectedInvoice.concept === 'products_services') && 
               selectedInvoice.service_date_from && selectedInvoice.service_date_to && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Período Servicio:</span>
                  <span>
                    {new Date(selectedInvoice.service_date_from).toLocaleDateString('es-AR')} - {new Date(selectedInvoice.service_date_to).toLocaleDateString('es-AR')}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Total Original:</span>
                <span className="font-medium">${selectedInvoice.total_amount.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo Disponible:</span>
                <span className="font-bold text-green-600">${selectedInvoice.available_balance.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
