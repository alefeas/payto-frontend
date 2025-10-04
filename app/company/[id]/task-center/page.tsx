"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, AlertTriangle, Clock, CheckCircle, DollarSign, FileX, Eye, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

// Mock pending tasks data
const mockPendingTasks = {
  rejectedInvoices: [
    { id: "1", number: "FC-001-00000128", client: "TechCorp SA", amount: 121000, priority: "high" },
    { id: "2", number: "FC-001-00000129", client: "StartupXYZ", amount: 85000, priority: "medium" }
  ],
  pendingApprovals: [
    { id: "3", number: "FC-001-00000130", client: "Consulting LLC", amount: 150000, daysWaiting: 2 },
    { id: "4", number: "FC-001-00000131", client: "MicroEmpresa SRL", amount: 45000, daysWaiting: 1 }
  ],
  pendingPayments: [
    { id: "5", paymentRef: "PAG-001", client: "GlobalTech Inc", amount: 200000, method: "transferencia" },
    { id: "6", paymentRef: "PAG-002", client: "TechCorp SA", amount: 75000, method: "cheque" }
  ],
  expiringSoon: [
    { id: "7", number: "FC-001-00000132", client: "StartupXYZ", amount: 95000, daysToExpire: 2 },
    { id: "8", number: "FC-001-00000133", client: "Consulting LLC", amount: 180000, daysToExpire: 1 }
  ]
}

export default function TaskCenterPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const getTotalTasks = () => {
    return mockPendingTasks.rejectedInvoices.length + 
           mockPendingTasks.pendingApprovals.length + 
           mockPendingTasks.pendingPayments.length + 
           mockPendingTasks.expiringSoon.length
  }

  const getUrgentTasks = () => {
    return mockPendingTasks.rejectedInvoices.length + 
           mockPendingTasks.expiringSoon.filter(task => task.daysToExpire <= 1).length
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Centro de Tareas</h1>
            <p className="text-muted-foreground">Vista unificada de todas las tareas pendientes</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pendientes</p>
                  <p className="text-2xl font-bold">{getTotalTasks()}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">{getUrgentTasks()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Por Aprobar</p>
                  <p className="text-2xl font-bold text-orange-600">{mockPendingTasks.pendingApprovals.length}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
                  <p className="text-2xl font-bold text-green-600">{mockPendingTasks.pendingPayments.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rejected Invoices - Highest Priority */}
        {mockPendingTasks.rejectedInvoices.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <FileX className="h-5 w-5" />
                Facturas Rechazadas - Acción Requerida
              </CardTitle>
              <CardDescription>Estas facturas necesitan corrección o disputa inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPendingTasks.rejectedInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">URGENTE</Badge>
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">{invoice.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">${invoice.amount.toLocaleString()}</span>
                      <Button size="sm" onClick={() => router.push(`/company/${companyId}/rejected-invoices`)}>
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expiring Soon */}
        {mockPendingTasks.expiringSoon.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Facturas por Vencer
              </CardTitle>
              <CardDescription>Facturas que vencen en los próximos días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPendingTasks.expiringSoon.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={invoice.daysToExpire <= 1 ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"}>
                        {invoice.daysToExpire} día{invoice.daysToExpire !== 1 ? 's' : ''}
                      </Badge>
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">{invoice.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">${invoice.amount.toLocaleString()}</span>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/company/${companyId}/invoices/${invoice.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Approvals */}
        {mockPendingTasks.pendingApprovals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                Facturas Pendientes de Aprobación
              </CardTitle>
              <CardDescription>Facturas esperando aprobación interna</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPendingTasks.pendingApprovals.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {invoice.daysWaiting} día{invoice.daysWaiting !== 1 ? 's' : ''} esperando
                      </Badge>
                      <div>
                        <p className="font-medium">{invoice.number}</p>
                        <p className="text-sm text-muted-foreground">{invoice.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">${invoice.amount.toLocaleString()}</span>
                      <Button size="sm" onClick={() => router.push(`/company/${companyId}/approve-invoices`)}>
                        Aprobar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Payments */}
        {mockPendingTasks.pendingPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pagos Pendientes de Confirmación
              </CardTitle>
              <CardDescription>Pagos declarados esperando confirmación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPendingTasks.pendingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {payment.method}
                      </Badge>
                      <div>
                        <p className="font-medium">{payment.paymentRef}</p>
                        <p className="text-sm text-muted-foreground">{payment.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">${payment.amount.toLocaleString()}</span>
                      <Button size="sm" onClick={() => router.push(`/company/${companyId}/confirm-payments`)}>
                        Confirmar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Tasks */}
        {getTotalTasks() === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">¡Todo al día!</p>
              <p className="text-sm text-muted-foreground">
                No hay tareas pendientes que requieran tu atención
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}