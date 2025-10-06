"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check, X, AlertCircle, Eye, Calendar, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { Payment, PaymentStatus } from "@/types/payment"

// Mock pagos pendientes de confirmación
const mockPendingPayments: Payment[] = [
  {
    id: "1",
    invoiceIds: ["FC-001-00000123"],
    payerCompanyId: "comp-2",
    payerCompanyName: "TechCorp SA",
    paymentDate: "2024-01-25",
    method: "transferencia",
    originalAmount: 121000,
    totalRetentions: 2420,
    netAmount: 118580,
    reference: "TRF-20240125-001234",
    notes: "Pago de factura mensual",
    status: "declared",
    retentions: [
      {
        id: "ret-1",
        type: "retencion_ganancias",
        name: "Retención Ganancias",
        rate: 2,
        baseAmount: 100000,
        amount: 2000,
        certificateNumber: "CERT-2024-001"
      },
      {
        id: "ret-2", 
        type: "retencion_iibb",
        name: "Retención IIBB",
        rate: 0.42,
        baseAmount: 100000,
        amount: 420,
        certificateNumber: "CERT-2024-002"
      }
    ],
    createdAt: "2024-01-25T10:30:00Z"
  },
  {
    id: "2",
    invoiceIds: ["FC-001-00000124", "FC-001-00000125"],
    payerCompanyId: "comp-3",
    payerCompanyName: "Consulting LLC",
    paymentDate: "2024-01-24",
    method: "transferencia",
    originalAmount: 206000,
    totalRetentions: 4120,
    netAmount: 201880,
    reference: "TRF-20240124-005678",
    notes: "Pago múltiple - 2 facturas",
    status: "declared",
    retentions: [
      {
        id: "ret-3",
        type: "retencion_ganancias",
        name: "Retención Ganancias",
        rate: 2,
        baseAmount: 170248,
        amount: 3405,
        certificateNumber: "CERT-2024-003"
      },
      {
        id: "ret-4",
        type: "retencion_iibb", 
        name: "Retención IIBB",
        rate: 0.42,
        baseAmount: 170248,
        amount: 715,
        certificateNumber: "CERT-2024-004"
      }
    ],
    createdAt: "2024-01-24T14:15:00Z"
  }
]

export default function ConfirmPaymentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  const [payments, setPayments] = useState<Payment[]>(mockPendingPayments)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const openConfirmModal = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowConfirmModal(true)
  }

  const confirmPayment = (paymentId: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { 
            ...payment, 
            status: 'confirmed' as PaymentStatus,
            confirmedAt: new Date().toISOString(),
            confirmedBy: "Usuario Actual"
          }
        : payment
    ))
    
    const payment = payments.find(p => p.id === paymentId)
    toast.success('Pago confirmado exitosamente', {
      description: `${payment?.payerCompanyName} - $${payment?.netAmount.toLocaleString()}`
    })
    
    setShowConfirmModal(false)
    setSelectedPayment(null)
  }

  const rejectPayment = (paymentId: string, reason: string) => {
    setPayments(prev => prev.map(payment => 
      payment.id === paymentId 
        ? { 
            ...payment, 
            status: 'rejected' as PaymentStatus,
            rejectionReason: reason,
            confirmedAt: new Date().toISOString(),
            confirmedBy: "Usuario Actual"
          }
        : payment
    ))
    
    const payment = payments.find(p => p.id === paymentId)
    toast.success('Pago rechazado', {
      description: `Se notificó a ${payment?.payerCompanyName}`
    })
    
    setShowRejectModal(false)
    setSelectedPayment(null)
    setRejectionReason("")
  }

  const openRejectModal = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowRejectModal(true)
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'declared':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente Confirmación</Badge>
      case 'confirmed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Confirmado</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rechazado</Badge>
      case 'partial':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Parcial</Badge>
    }
  }

  const pendingPayments = payments.filter(p => p.status === 'declared')
  const processedPayments = payments.filter(p => p.status !== 'declared')

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Confirmar Pagos</h1>
            <p className="text-muted-foreground">Revisar y confirmar pagos recibidos</p>
          </div>
        </div>

        {/* Pagos Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Pagos Pendientes de Confirmación
              {pendingPayments.length > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingPayments.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Estos pagos fueron declarados por los clientes y requieren su confirmación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No hay pagos pendientes</p>
                <p className="text-sm">Todos los pagos han sido procesados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{payment.payerCompanyName}</span>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </div>
                          <span>•</span>
                          <span>{payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}</span>
                          {payment.reference && (
                            <>
                              <span>•</span>
                              <span>Ref: {payment.reference}</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Facturas: </span>
                          <span>{payment.invoiceIds.join(", ")}</span>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <p className="text-2xl font-bold text-green-600">
                          ${payment.netAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Original: ${payment.originalAmount.toLocaleString()}
                        </p>
                        {payment.totalRetentions > 0 && (
                          <p className="text-xs text-red-600">
                            Retenciones: -${payment.totalRetentions.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Detalles de Retenciones */}
                    {payment.retentions.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Retenciones aplicadas:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {payment.retentions.map((retention) => (
                            <div key={retention.id} className="flex justify-between">
                              <span>{retention.name} ({retention.rate}%)</span>
                              <span className="font-medium">-${retention.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {payment.notes && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm"><strong>Notas:</strong> {payment.notes}</p>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-3 pt-2">
                      <Button 
                        onClick={() => openConfirmModal(payment)}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirmar Pago
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => openRejectModal(payment)}
                        className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagos Procesados */}
        {processedPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Pagos Procesados
              </CardTitle>
              <CardDescription>Historial de pagos confirmados y rechazados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processedPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{payment.payerCompanyName}</span>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.invoiceIds.join(", ")} • {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                      {payment.rejectionReason && (
                        <div className="text-sm text-red-600">
                          Motivo: {payment.rejectionReason}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${payment.netAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.confirmedAt && new Date(payment.confirmedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de Confirmación */}
        {showConfirmModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-green-700">Confirmar Pago Recibido</CardTitle>
                <CardDescription>
                  {selectedPayment.payerCompanyName} - ${selectedPayment.netAmount.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✓ Confirmar:</strong> El dinero fue recibido en su cuenta bancaria. 
                    Esta acción marcará el pago como confirmado.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Facturas: {selectedPayment.invoiceIds.join(", ")}</p>
                  <p className="text-sm text-muted-foreground">Fecha: {new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">Método: {selectedPayment.method}</p>
                  {selectedPayment.reference && (
                    <p className="text-sm text-muted-foreground">Referencia: {selectedPayment.reference}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowConfirmModal(false)
                      setSelectedPayment(null)
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => confirmPayment(selectedPayment.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Confirmar Pago
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Rechazo */}
        {showRejectModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-700">Rechazar Pago</CardTitle>
                <CardDescription>
                  {selectedPayment.payerCompanyName} - ${selectedPayment.netAmount.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo del rechazo *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Explique por qué rechaza este pago..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRejectModal(false)
                      setSelectedPayment(null)
                      setRejectionReason("")
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => rejectPayment(selectedPayment.id, rejectionReason)}
                    disabled={!rejectionReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Rechazar Pago
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