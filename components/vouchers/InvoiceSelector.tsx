"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, AlertCircle, Check, ChevronsUpDown, Search } from "lucide-react"
import { voucherService } from "@/services/voucher.service"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

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
  mode?: "issued" | "received"
  onSelect: (invoice: Invoice | null) => void
  disabled?: boolean
}

export function InvoiceSelector({ 
  companyId, 
  voucherType,
  mode,
  onSelect,
  disabled = false 
}: InvoiceSelectorProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    const loadInvoices = async () => {
      if (!voucherType) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        let data
        if (mode === "issued") {
          data = await voucherService.getCompatibleInvoicesForManualIssued(companyId, voucherType)
        } else if (mode === "received") {
          data = await voucherService.getCompatibleInvoicesForManualReceived(companyId, voucherType)
        } else {
          data = await voucherService.getCompatibleInvoices(companyId, voucherType)
        }
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
  }, [companyId, voucherType, mode])

  const handleSelect = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    const invoice = invoices.find(inv => inv.id === invoiceId)
    onSelect(invoice || null)
    setSearchTerm("")
  }

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Factura a Asociar *</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={disabled || isLoading || invoices.length === 0}
            >
              {selectedInvoiceId
                ? (() => {
                    const invoice = invoices.find(inv => inv.id === selectedInvoiceId)
                    return invoice ? `${invoice.invoice_type} ${invoice.invoice_number} - ${invoice.client_name}` : "Seleccione una factura"
                  })()
                : isLoading ? "Cargando facturas..." : 
                  invoices.length === 0 ? "No hay facturas disponibles" :
                  "Seleccione una factura"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-96" align="start">
            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
              Facturas Disponibles
            </DropdownMenuLabel>
            {invoices.length > 3 && (
              <div className="px-2 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="Buscar por número o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredInvoices.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No se encontraron facturas
                </div>
              ) : (
                filteredInvoices.map((invoice) => {
                  const conceptLabel = invoice.concept === 'services' ? 'Servicios' : 
                                       invoice.concept === 'products_services' ? 'Productos y Servicios' : 'Productos'
                  return (
                    <DropdownMenuItem
                      key={invoice.id}
                      onClick={() => handleSelect(invoice.id)}
                      className="gap-2 p-2 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          <span className="font-medium">
                            {invoice.invoice_type} {invoice.invoice_number}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {invoice.client_name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>Concepto: {conceptLabel}</span>
                          <span>•</span>
                          <span>Saldo: ${invoice.available_balance.toLocaleString('es-AR')} de ${invoice.total_amount.toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                      {invoice.id === selectedInvoiceId && <Check className="h-4 w-4 shrink-0" />}
                    </DropdownMenuItem>
                  )
                })
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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
