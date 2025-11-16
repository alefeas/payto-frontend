"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { CheckCircle, XCircle, FileText, User, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layouts/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InfoMessage } from "@/components/ui/info-message"
import { ApproveInvoicesSkeleton } from "@/components/invoices/ApproveInvoicesSkeleton"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { invoiceService, Invoice } from "@/services/invoice.service"
import { companyService } from "@/services/company.service"
import { parseDateLocal } from "@/lib/utils"
import { colors } from "@/styles"
import { hasPermission } from "@/lib/permissions"
import { CompanyRole } from "@/types"

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
  const [company, setCompany] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/log-in')
    } else if (isAuthenticated && id) {
      loadData()
    }
  }, [isAuthenticated, authLoading, id, router])

  // Verificar permisos de acceso
  useEffect(() => {
    if (company) {
      const userRole = company.role as CompanyRole
      if (!hasPermission(userRole, 'invoices.approve')) {
        toast.error('No tienes permisos para aprobar facturas')
        router.push(`/company/${id}`)
        return
      }
    }
  }, [company, router, id])

  const loadData = async () => {
    try {
      setLoading(true)
      const companyData = await companyService.getCompany(id as string)
      setCompany(companyData)
      setCompanyName(companyData.name)
      const reqApprovals = companyData.requiredApprovals !== undefined ? companyData.requiredApprovals : (companyData.required_approvals !== undefined ? companyData.required_approvals : 0)
      setRequiredApprovals(reqApprovals)
      
      if (user?.id) {
        setCurrentUserId(user.id)
      }
      
      // Fetch all invoices across all pages
      let allInvoices: Invoice[] = []
      let page = 1
      let hasMore = true
      
      while (hasMore) {
        const result = await invoiceService.getInvoices(id as string, page)
        const data = result.data || []
        if (Array.isArray(data) && data.length > 0) {
          allInvoices = [...allInvoices, ...data]
          page++
        } else {
          hasMore = false
        }
      }
      
      // Filtrar facturas normales y ND/NC no asociadas que necesitan aprobación
      const pendingInvoices = allInvoices.filter((inv: Invoice) => {
        const status = inv.display_status || inv.status
        if (status !== 'pending_approval') return false
        
        const isCreditNote = ['NCA', 'NCB', 'NCC', 'NCM', 'NCE'].includes(inv.type)
        const isDebitNote = ['NDA', 'NDB', 'NDC', 'NDM', 'NDE'].includes(inv.type)
        
        // Si es factura normal, incluir
        if (!isCreditNote && !isDebitNote) return true
        
        // Si es ND/NC, solo incluir si NO está asociada a una factura
        if (isCreditNote || isDebitNote) {
          return !(inv as any).related_invoice_id
        }
        
        return false
      }).sort((a, b) => {
        // Ordenar por fecha de vencimiento (más próximas primero)
        const dateA = new Date(a.due_date).getTime()
        const dateB = new Date(b.due_date).getTime()
        return dateA - dateB
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
    return <ApproveInvoicesSkeleton />
  }
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <PageHeader 
          title="Aprobar Facturas"
          description="Aprueba o rechaza facturas de proveedores"
          backHref={`/company/${id}`}
        />

        <InfoMessage
          icon={CheckCircle}
          iconColor={colors.accent}
          variant="success"
          description={
            requiredApprovals === 0 ? (
              <span>Las facturas se <strong>aprueban automáticamente</strong> (sin control). Cambia esto en Configuración.</span>
            ) : (
              <span>Se requieren <strong>{requiredApprovals}</strong> {requiredApprovals === 1 ? 'aprobación' : 'aprobaciones'} para pagar facturas (configurable en Configuración).</span>
            )
          }
        />

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
                <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: colors.accent }} />
                <p className="text-lg font-medium">No hay facturas pendientes</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Todas las facturas están aprobadas o no requieren aprobación
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-accent/50 transition-colors">
                    {/* Top row: Invoice info with view button fixed at top-right */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colors.accent }} />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm sm:text-base">
                            Factura {invoice.type} {String(invoice.sales_point).padStart(4, '0')}-{String(invoice.voucher_number).padStart(8, '0')}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {invoice.issuerCompany?.business_name || invoice.issuerCompany?.name || invoice.client?.business_name}
                          </p>
                        </div>
                      </div>
                      
                      {/* View button - always top right */}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => viewInvoiceDetails(invoice.id)}
                        className="flex-shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Bottom row: Total, Vencimiento, Badge, and Action buttons */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-1">
                        <div className="text-left">
                          <p className="text-xs font-light text-muted-foreground">Total</p>
                          <p className="font-medium text-sm sm:text-base">${invoice.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        
                        <div className="text-left">
                          <p className="text-xs font-light text-muted-foreground">Vencimiento</p>
                          <p className="font-medium text-xs sm:text-sm">{parseDateLocal(invoice.due_date)?.toLocaleDateString('es-AR')}</p>
                        </div>
                        
                        <Badge variant={invoice.approvals_received >= invoice.approvals_required ? "default" : "secondary"} className="w-fit flex-shrink-0">
                          {invoice.approvals_received}/{invoice.approvals_required}
                        </Badge>
                      </div>
                      
                      {/* Action buttons - right side on md, below on smaller screens */}
                      <div className="flex gap-2 flex-shrink-0 md:ml-auto">
                        {invoice.approvals?.some(a => a.user?.id === currentUserId) ? (
                          <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md text-sm">
                            <CheckCircle className="h-4 w-4" style={{ color: colors.accent }} />
                            <span className="font-medium" style={{ color: colors.accent }}>Ya aprobaste</span>
                          </div>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => openApproveDialog(invoice)}
                              style={{ backgroundColor: colors.accent }}
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
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-sm">
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
            <div className="space-y-3">
              <label className="text-sm font-medium mb-2 block">Notas (opcional)</label>
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
            <Button onClick={handleApprove} disabled={processing} style={{ backgroundColor: colors.accent }}>
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
            <div className="space-y-3">
              <label className="text-sm font-medium mb-2 block">Motivo del rechazo *</label>
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
