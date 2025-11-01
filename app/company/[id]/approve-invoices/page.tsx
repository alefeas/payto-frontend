"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User, Eye } from "lucide-react"
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
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  
  const [companyName, setCompanyName] = useState("")
  const [requiredApprovals, setRequiredApprovals] = useState(0)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (isAuthenticated && id) {
      loadData()
    }
  }, [isAuthenticated, authLoading, id, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const company = await companyService.getCompany(id as string)
      setCompanyName(company.name)
      const reqApprovals = company.requiredApprovals !== undefined ? company.requiredApprovals : (company.required_approvals !== undefined ? company.required_approvals : 0)
      setRequiredApprovals(reqApprovals)
      
      if (user?.id) {
        setCurrentUserId(user.id)
      }
      
      const result = await invoiceService.getInvoices(id as string)
      // Filtrar facturas que necesitan aprobación
      const pendingInvoices = (result.data || []).filter((inv: Invoice) => {
        const status = inv.display_status || inv.status
        return status === 'pending_approval'
      })
      setInvoices(pendingInvoices)
    } catch (error: any) {
      console.error('Error loading invoices:', error)
      toast.error(error.response?.data?.message || 'Error al cargar facturas')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedInvoice) return
    
    try {
      setProcessing(true)
      const result = await invoiceService.approveInvoice(id as string, selectedInvoice.id, approvalNotes)
      
      // Check if invoice is fully approved
      if (result.approvals_received >= result.approvals_required) {
        // Invoice fully approved, remove from list
        setInvoices(prev => prev.filter(inv => inv.id !== selectedInvoice.id))
        toast.success('Factura aprobada completamente')
      } else {
        // Invoice partially approved, update local state
        setInvoices(prev => prev.map(inv => 
          inv.id === selectedInvoice.id 
            ? { ...inv, approvals_received: result.approvals_received }
            : inv
        ))
        toast.success(`Aprobación registrada (${result.approvals_received}/${result.approvals_required})`)
      }
      
      setShowApproveDialog(false)
      setApprovalNotes("")
      setSelectedInvoice(null)
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
      
      // Update local state instead of reloading
      setInvoices(prev => prev.filter(inv => inv.id !== selectedInvoice.id))
      
      toast.success('Factura rechazada')
      setShowRejectDialog(false)
      setRejectionReason("")
      setSelectedInvoice(null)
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

  const viewInvoiceDetails = (invoiceId: string) => {
    router.push(`/company/${id}/invoices/${invoiceId}`)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }
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
            {requiredApprovals === 0 ? (
              <span>Las facturas se <strong>aprueban automáticamente</strong> (sin control). Cambia esto en Configuración.</span>
            ) : (
              <span>Se requieren <strong>{requiredApprovals}</strong> {requiredApprovals === 1 ? 'aprobación' : 'aprobaciones'} para pagar facturas (configurable en Configuración).</span>
            )}
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
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold truncate">
                              Factura {invoice.type} {String(invoice.sales_point).padStart(4, '0')}-{String(invoice.voucher_number).padStart(8, '0')}
                            </p>
                            <Badge variant={invoice.approvals_received >= invoice.approvals_required ? "default" : "secondary"}>
                              {invoice.approvals_received}/{invoice.approvals_required}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {invoice.issuerCompany?.business_name || invoice.issuerCompany?.name || invoice.client?.business_name}
                          </p>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-bold text-lg">${invoice.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        
                        <div className="text-right flex-shrink-0 hidden md:block">
                          <p className="text-sm text-muted-foreground">Vencimiento</p>
                          <p className="text-sm font-medium">{new Date(invoice.due_date).toLocaleDateString('es-AR')}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => viewInvoiceDetails(invoice.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.approvals?.some(a => a.user?.id === currentUserId) ? (
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Ya aprobaste</span>
                          </div>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => openApproveDialog(invoice)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openRejectDialog(invoice)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {invoice.approvals_received > 0 && invoice.approvals && Array.isArray(invoice.approvals) && invoice.approvals.length > 0 && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Aprobado por:</span>
                        <div className="flex flex-wrap gap-1">
                          {invoice.approvals.map((approval, idx) => {
                            const fullName = approval.user?.first_name && approval.user?.last_name 
                              ? `${approval.user.first_name} ${approval.user.last_name}`.trim()
                              : approval.user?.name?.trim()
                            return (
                              <Badge key={approval.id || idx} variant="secondary" className="text-xs">
                                {fullName || approval.user?.email?.split('@')[0] || `Aprobador ${idx + 1}`}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
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
