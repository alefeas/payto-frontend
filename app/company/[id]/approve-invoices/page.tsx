"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, AlertCircle, Eye, Calendar, Building2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// Mock facturas pendientes de aprobación
const mockPendingInvoices = [
  {
    id: "1",
    number: "FC-001-00000123",
    type: "A",
    issuerCompany: "StartupXYZ",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    subtotal: 100000,
    taxes: 21000,
    total: 121000,
    currency: "ARS",
    status: "pendiente_aprobacion",
    items: [
      {
        description: "Desarrollo de aplicación web",
        quantity: 1,
        unitPrice: 100000
      }
    ],
    notes: "Desarrollo completo de sistema de gestión",
    sentAt: "2024-01-15T10:30:00Z",
    approvals: []
  },
  {
    id: "2",
    number: "FC-001-00000124",
    type: "B",
    issuerCompany: "Consulting LLC",
    issueDate: "2024-01-20",
    dueDate: "2024-02-20",
    subtotal: 85000,
    taxes: 17850,
    total: 102850,
    currency: "ARS",
    status: "aprobacion_parcial",
    items: [
      {
        description: "Consultoría técnica",
        quantity: 10,
        unitPrice: 8500
      }
    ],
    notes: "Servicios de consultoría para optimización",
    sentAt: "2024-01-20T14:15:00Z",
    approvals: [
      {
        approverId: "user-123",
        approver: "Juan Pérez",
        role: "Gerente",
        approvedAt: "2024-01-21T09:15:00Z",
        notes: "Aprobado por gerencia"
      }
    ]
  }
]

type InvoiceStatus = "pendiente_aprobacion" | "aprobacion_parcial" | "aprobada" | "rechazada"

export default function ApproveInvoicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [invoices, setInvoices] = useState(mockPendingInvoices)
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockPendingInvoices[0] | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const openApproveModal = (invoice: typeof mockPendingInvoices[0]) => {
    setSelectedInvoice(invoice)
    setShowApproveModal(true)
  }

  const approveInvoice = (invoiceId: string) => {
    const currentUserId = "current-user-id" // En producción vendría del contexto de auth
    
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        // Verificar si el usuario ya aprobó
        const hasAlreadyApproved = invoice.approvals?.some(approval => approval.approverId === currentUserId)
        if (hasAlreadyApproved) {
          toast.error('Ya has aprobado esta factura')
          return invoice
        }
        
        const newApproval = {
          approverId: currentUserId,
          approver: "Usuario Actual",
          role: "Aprobador",
          approvedAt: new Date().toISOString(),
          notes: ""
        }
        
        const updatedApprovals = [...(invoice.approvals || []), newApproval]
        const newStatus = updatedApprovals.length >= 2 ? 'aprobada' : 'aprobacion_parcial'
        
        return {
          ...invoice,
          status: newStatus as InvoiceStatus,
          approvals: updatedApprovals
        }
      }
      return invoice
    }))
    
    const invoice = invoices.find(inv => inv.id === invoiceId)
    const approvalsCount = (invoice?.approvals?.length || 0) + 1
    
    if (approvalsCount >= 2) {
      toast.success('Factura completamente aprobada', {
        description: `${invoice?.number} lista para pago`
      })
    } else {
      toast.success('Primera aprobación registrada', {
        description: `Falta 1 aprobación más para ${invoice?.number}`
      })
    }
    
    setShowApproveModal(false)
    setSelectedInvoice(null)
  }

  const rejectInvoice = (invoiceId: string, reason: string) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { 
            ...invoice, 
            status: 'rechazada' as InvoiceStatus,
            rejectionReason: reason,
            rejectedAt: new Date().toISOString(),
            rejectedBy: "Usuario Actual"
          }
        : invoice
    ))
    
    const invoice = invoices.find(inv => inv.id === invoiceId)
    toast.success('Factura rechazada definitivamente', {
      description: `Se notificó a ${invoice?.issuerCompany}`
    })
    
    setShowRejectModal(false)
    setSelectedInvoice(null)
    setRejectionReason("")
  }

  const openRejectModal = (invoice: typeof mockPendingInvoices[0]) => {
    setSelectedInvoice(invoice)
    setShowRejectModal(true)
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'pendiente_aprobacion':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente Aprobación</Badge>
      case 'aprobacion_parcial':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">1/2 Aprobaciones</Badge>
      case 'aprobada':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprobada</Badge>
      case 'rechazada':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rechazada</Badge>
    }
  }

  const pendingInvoices = invoices.filter(inv => 
    inv.status === 'pendiente_aprobacion' || inv.status === 'aprobacion_parcial'
  )
  const processedInvoices = invoices.filter(inv => inv.status !== 'pendiente_aprobacion')

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Aprobar Facturas</h1>
            <p className="text-muted-foreground">Revisar y aprobar facturas recibidas</p>
          </div>
        </div>

        {/* Facturas Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Facturas Pendientes de Aprobación
              {pendingInvoices.length > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingInvoices.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Estas facturas fueron enviadas por proveedores y requieren su aprobación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No hay facturas pendientes</p>
                <p className="text-sm">Todas las facturas han sido procesadas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInvoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{invoice.number}</span>
                          <Badge variant="outline">Tipo {invoice.type}</Badge>
                          {getStatusBadge(invoice.status as InvoiceStatus)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {invoice.issuerCompany}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Emitida: {new Date(invoice.issueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Vence: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <p className="text-2xl font-bold text-blue-600">
                          ${invoice.total.toLocaleString()} {invoice.currency}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Subtotal: ${invoice.subtotal.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Impuestos: ${invoice.taxes.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Detalles de Ítems */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium mb-2">Ítems:</p>
                      <div className="space-y-1">
                        {invoice.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.description}</span>
                            <span>{item.quantity} x ${item.unitPrice.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Historial de Aprobaciones */}
                    {invoice.approvals && invoice.approvals.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Aprobaciones ({invoice.approvals.length}/2):</p>
                        <div className="space-y-1">
                          {invoice.approvals.map((approval, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{approval.approver} ({approval.role})</span>
                              <span className="text-muted-foreground">
                                {new Date(approval.approvedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {invoice.notes && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm"><strong>Notas:</strong> {invoice.notes}</p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-3 pt-2">
                      <Button 
                        onClick={() => openApproveModal(invoice)}
                        className="flex-1"
                        disabled={invoice.approvals?.length >= 2 || 
                                 invoice.approvals?.some(approval => approval.approverId === "current-user-id")}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {invoice.approvals?.some(approval => approval.approverId === "current-user-id") ? 'Ya Aprobada por Ti' :
                         invoice.approvals?.length === 0 ? 'Primera Aprobación' : 
                         invoice.approvals?.length === 1 ? 'Segunda Aprobación' : 'Aprobada'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => openRejectModal(invoice)}
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => router.push(`/company/${companyId}/invoices/${invoice.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Facturas Procesadas */}
        {processedInvoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Facturas Procesadas
              </CardTitle>
              <CardDescription>Historial de facturas aprobadas y rechazadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processedInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{invoice.number}</span>
                        <Badge variant="outline">Tipo {invoice.type}</Badge>
                        {getStatusBadge(invoice.status as InvoiceStatus)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.issuerCompany} • {new Date(invoice.issueDate).toLocaleDateString()}
                      </div>
                      {invoice.rejectionReason && (
                        <div className="text-sm text-red-600">
                          Motivo: {invoice.rejectionReason}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${invoice.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.approvedAt && new Date(invoice.approvedAt).toLocaleDateString()}
                        {invoice.processedAt && new Date(invoice.processedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de Aprobación */}
        {showApproveModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-green-700">Confirmar Aprobación</CardTitle>
                <CardDescription>
                  {selectedInvoice.number} de {selectedInvoice.issuerCompany}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✓ Confirmar:</strong> {selectedInvoice.approvals?.length === 0 ? 
                      'Esta será la primera aprobación. Se necesitará una aprobación más.' :
                      'Esta será la segunda aprobación. La factura quedará lista para pago.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Monto: ${selectedInvoice.total.toLocaleString()} {selectedInvoice.currency}</p>
                  <p className="text-sm text-muted-foreground">Vence: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowApproveModal(false)
                      setSelectedInvoice(null)
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => approveInvoice(selectedInvoice.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Aprobar Factura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Rechazo */}
        {showRejectModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-700">Rechazar Factura</CardTitle>
                <CardDescription>
                  {selectedInvoice.number} de {selectedInvoice.issuerCompany}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Atención:</strong> El rechazo de cualquier aprobador es definitivo. 
                    La factura será rechazada completamente y se notificará al proveedor.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo del rechazo *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explique por qué rechaza esta factura..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRejectModal(false)
                      setSelectedInvoice(null)
                      setRejectionReason("")
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => rejectInvoice(selectedInvoice.id, rejectionReason)}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Rechazar Factura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}