"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { invoiceService, Invoice } from "@/services/invoice.service"
import { companyService } from "@/services/company.service"

export default function ApproveInvoicesPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [companyName, setCompanyName] = useState("")
  const [requiredApprovals, setRequiredApprovals] = useState(0)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    } else if (isAuthenticated && id) {
      loadData()
    }
  }, [isAuthenticated, authLoading, id, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const company = await companyService.getCompany(id as string)
      setCompanyName(company.name)
      setRequiredApprovals(company.requiredApprovals || company.required_approvals || 1)
      
      const result = await invoiceService.getInvoices(id as string, 'pending_approval')
      setInvoices(result.data)
    } catch (error: any) {
      toast.error('Error al cargar facturas')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedInvoice) return
    
    try {
      setProcessing(true)
      await invoiceService.approveInvoice(id as string, selectedInvoice.id, approvalNotes)
      toast.success('Factura aprobada exitosamente')
      setShowApproveDialog(false)
      setApprovalNotes("")
      setSelectedInvoice(null)
      await loadData()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al aprobar factura'
      toast.error(errorMsg)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedInvoice || !rejectionReason.trim()) {
      toast.error('Debes ingresar un motivo de rechazo')
      return
    }
    
    try {
      setProcessing(true)
      await invoiceService.rejectInvoice(id as string, selectedInvoice.id, rejectionReason)
      toast.success('Factura rechazada')
      setShowRejectDialog(false)
      setRejectionReason("")
      setSelectedInvoice(null)
      await loadData()
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al rechazar factura'
      toast.error(errorMsg)
    } finally {
      setProcessing(false)
    }
  }

  const openApproveDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowApproveDialog(true)
  }

  const openRejectDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowRejectDialog(true)
  }

  if (authLoading || loading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Aprobar Facturas</h1>
            <p className="text-muted-foreground">{companyName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            Se requieren <strong>{requiredApprovals}</strong> {requiredApprovals === 1 ? 'aprobación' : 'aprobaciones'} para pagar facturas (mínimo 1, configurable en Configuración).
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Facturas Pendientes de Aprobación</CardTitle>
            <CardDescription>
              {invoices.length} {invoices.length === 1 ? 'factura pendiente' : 'facturas pendientes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">No hay facturas pendientes</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Todas las facturas están aprobadas o no requieren aprobación
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="font-semibold text-lg">
                                Factura {invoice.type} {String(invoice.sales_point).padStart(4, '0')}-{String(invoice.voucher_number).padStart(8, '0')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {invoice.issuerCompany?.business_name || invoice.issuerCompany?.name}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Fecha</p>
                              <p className="font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Vencimiento</p>
                              <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-medium text-lg">${invoice.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Aprobaciones</p>
                              <div className="flex items-center gap-2">
                                <Badge variant={invoice.approvals_received >= invoice.approvals_required ? "default" : "secondary"}>
                                  {invoice.approvals_received}/{invoice.approvals_required}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {invoice.approvals && invoice.approvals.length > 0 && (
                            <div className="pt-3 border-t">
                              <p className="text-sm font-medium mb-2">Aprobado por:</p>
                              <div className="flex flex-wrap gap-2">
                                {invoice.approvals.map((approval) => (
                                  <Badge key={approval.id} variant="outline" className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {approval.user.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            size="sm" 
                            onClick={() => openApproveDialog(invoice)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => openRejectDialog(invoice)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Factura</DialogTitle>
            <DialogDescription>
              ¿Confirmas la aprobación de la factura {selectedInvoice?.type} {String(selectedInvoice?.sales_point).padStart(4, '0')}-{String(selectedInvoice?.voucher_number).padStart(8, '0')}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notas (opcional)</label>
              <Textarea
                placeholder="Agregar comentarios sobre la aprobación..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={processing}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
              {processing ? 'Aprobando...' : 'Aprobar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Factura</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo de la factura {selectedInvoice?.type} {String(selectedInvoice?.sales_point).padStart(4, '0')}-{String(selectedInvoice?.voucher_number).padStart(8, '0')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Motivo del rechazo *</label>
              <Textarea
                placeholder="Explica por qué rechazas esta factura..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={processing}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectionReason.trim()}>
              {processing ? 'Rechazando...' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
