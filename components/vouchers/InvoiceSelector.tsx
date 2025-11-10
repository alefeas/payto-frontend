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
import { cn, parseDateLocal } from "@/lib/utils"

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
  currency?: string
  exchange_rate?: number
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

  const filteredInvoices = invoices.filter((inv: any) =>
    (inv.number || inv.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.receiver_name || inv.issuer_name || inv.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                    const invoice: any = invoices.find(inv => inv.id === selectedInvoiceId)
                    const number = invoice?.number || invoice?.invoice_number || ''
                    const type = invoice?.type || invoice?.invoice_type || ''
                    const name = invoice?.receiver_name || invoice?.issuer_name || invoice?.client_name || ''
                    return invoice ? `${type} ${number} - ${name}` : "Seleccione una factura"
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
                filteredInvoices.map((invoice: any) => {
                  const conceptLabel = invoice.concept === 'services' ? 'Servicios' : 
                                       invoice.concept === 'products_services' ? 'Productos y Servicios' : 'Productos'
                  const number = invoice.number || invoice.invoice_number || ''
                  const type = invoice.type || invoice.invoice_type || ''
                  const name = invoice.receiver_name || invoice.issuer_name || invoice.client_name || ''
                  const total = invoice.total || invoice.total_amount || 0
                  const balance = invoice.available_balance || invoice.balance_pending || 0
                  
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
                            {type} {number}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1.5">
                            {invoice.origin && <span className="text-blue-600">{invoice.origin}</span>}
                            {invoice.origin && <span>•</span>}
                            {invoice.status_label && <span className="text-green-600">{invoice.status_label}</span>}
                            {(invoice.origin || invoice.status_label) && <span>•</span>}
                            <span>Concepto: {conceptLabel}</span>
                            <span>•</span>
                            <span className="font-medium">Saldo: {invoice.currency || 'ARS'} ${balance.toLocaleString('es-AR')} de ${total.toLocaleString('es-AR')}</span>
                          </div>
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

      {selectedInvoice && (() => {
        const inv: any = selectedInvoice
        const number = inv.number || inv.invoice_number || ''
        const type = inv.type || inv.invoice_type || ''
        const name = inv.receiver_name || inv.issuer_name || inv.client_name || ''
        const total = inv.total || inv.total_amount || 0
        const balance = inv.balance_pending || inv.available_balance || 0
        
        return (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Factura:</span>
                <span className="font-medium">{type} {number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Concepto:</span>
                <span className="font-medium">
                  {inv.concept === 'services' ? 'Servicios' : 
                   inv.concept === 'products_services' ? 'Productos y Servicios' : 'Productos'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha Emisión:</span>
                <span>{parseDateLocal(inv.issue_date)?.toLocaleDateString('es-AR')}</span>
              </div>
              {(inv.concept === 'services' || inv.concept === 'products_services') && 
               inv.service_date_from && inv.service_date_to && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Período Servicio:</span>
                  <span>
                    {parseDateLocal(inv.service_date_from)?.toLocaleDateString('es-AR')} - {parseDateLocal(inv.service_date_to)?.toLocaleDateString('es-AR')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moneda:</span>
                <span className="font-medium">{inv.currency || 'ARS'}</span>
              </div>
              {inv.currency && inv.currency !== 'ARS' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cotización:</span>
                  <span className="font-medium">${typeof inv.exchange_rate === 'number' ? inv.exchange_rate.toFixed(2) : (parseFloat(inv.exchange_rate) || 1).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Total Original:</span>
                <span className="font-medium">{inv.currency || 'ARS'} ${total.toLocaleString('es-AR')}</span>
              </div>
              {(type === 'NC' || type === 'ND') && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saldo Disponible:</span>
                  <span className="font-bold text-green-600">{inv.currency || 'ARS'} ${balance.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )
      })()}
    </div>
  )
}
