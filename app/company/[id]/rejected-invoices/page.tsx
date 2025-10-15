"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, AlertTriangle, FileX, Eye, Mail, Phone, Archive, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { invoiceService, Invoice } from "@/services/invoice.service"

export default function RejectedInvoicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated) {
      loadInvoices()
    }
  }, [isAuthenticated, authLoading, router])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const result = await invoiceService.getInvoices(companyId, 'rejected')
      setInvoices(result.data || [])
    } catch (error: any) {
      toast.error('Error al cargar facturas rechazadas')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (invoiceId: string) => {
    router.push(`/company/${companyId}/invoices/${invoiceId}`)
  }

  const openContactDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowContactDialog(true)
  }

  const openArchiveDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowArchiveDialog(true)
  }

  const handleArchive = async () => {
    if (!selectedInvoice) return
    try {
      setArchiving(true)
      await invoiceService.archiveInvoice(companyId, selectedInvoice.id)
      setInvoices(prev => prev.filter(inv => inv.id !== selectedInvoice.id))
      toast.success('Factura archivada')
      setShowArchiveDialog(false)
      setSelectedInvoice(null)
    } catch (error: any) {
      toast.error('Error al archivar factura')
    } finally {
      setArchiving(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  if (authLoading || loading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Facturas Rechazadas</h1>
            <p className="text-muted-foreground">Gestionar facturas que requieren atención</p>
          </div>
        </div>

        {invoices.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">
                  {invoices.length} {invoices.length === 1 ? 'factura requiere' : 'facturas requieren'} atención
                </p>
                <p className="text-sm text-red-700">
                  Revisa los motivos y toma las acciones necesarias
                </p>
              </div>
            </div>
          </div>
        )}

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No hay facturas rechazadas</p>
              <p className="text-sm text-muted-foreground mt-2">
                Todas las facturas están aprobadas o pendientes de revisión
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileX className="h-5 w-5 text-red-600" />
                        Factura {invoice.type} {String(invoice.sales_point).padStart(4, '0')}-{String(invoice.voucher_number).padStart(8, '0')}
                      </CardTitle>
                      <CardDescription>
                        {invoice.client?.business_name || invoice.issuerCompany?.business_name} • ${Number(invoice.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">Rechazada</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-900 mb-1">
                      Rechazada el {new Date(invoice.rejected_at || '').toLocaleDateString('es-AR')}
                    </p>
                    <p className="text-sm text-red-700">{invoice.rejection_reason || 'Sin motivo especificado'}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(invoice.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openContactDialog(invoice)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contactar Proveedor
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openArchiveDialog(invoice)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archivar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contactar Proveedor</DialogTitle>
            <DialogDescription>
              Información de contacto para resolver el problema con la factura
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-900 mb-1">Motivo del rechazo:</p>
                <p className="text-sm text-red-700">{selectedInvoice.rejection_reason || 'Sin motivo especificado'}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Proveedor</p>
                  <p className="text-sm">{selectedInvoice.client?.business_name || 'Sin nombre'}</p>
                </div>

                {selectedInvoice.client?.email && (
                  <div>
                    <p className="text-sm font-medium mb-1">Email</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm flex-1">{selectedInvoice.client.email}</p>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(selectedInvoice.client!.email!, 'Email')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" onClick={() => window.location.href = `mailto:${selectedInvoice.client!.email}`}>
                        <Mail className="h-3 w-3 mr-1" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                )}

                {selectedInvoice.client?.phone && (
                  <div>
                    <p className="text-sm font-medium mb-1">Teléfono</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm flex-1">{selectedInvoice.client.phone}</p>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(selectedInvoice.client!.phone!, 'Teléfono')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" onClick={() => window.open(`https://wa.me/${selectedInvoice.client!.phone!.replace(/\D/g, '')}`, '_blank')}>
                        <Phone className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                )}

                {!selectedInvoice.client?.email && !selectedInvoice.client?.phone && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No hay información de contacto disponible</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archivar Factura</DialogTitle>
            <DialogDescription>
              La factura se marcará como resuelta y saldrá de esta lista
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Confirmas que el problema con esta factura ha sido resuelto y deseas archivarla?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)} disabled={archiving}>
              Cancelar
            </Button>
            <Button onClick={handleArchive} disabled={archiving}>
              {archiving ? 'Archivando...' : 'Archivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}