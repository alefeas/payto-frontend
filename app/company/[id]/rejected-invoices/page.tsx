"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, AlertTriangle, Edit, FileX, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// Mock rejected invoices
const mockRejectedInvoices = [
  {
    id: "1",
    number: "FC-001-00000128",
    clientCompany: "TechCorp SA",
    total: 121000,
    currency: "ARS",
    rejectedAt: "2024-01-25T14:30:00Z",
    rejectedBy: "María González",
    rejectionReason: "Los servicios descritos no coinciden con lo acordado en el contrato."
  }
]

export default function RejectedInvoicesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const handleCorrectInvoice = (invoiceId: string) => {
    toast.success('Redirigiendo para corregir factura')
    router.push(`/company/${companyId}/create-invoice?correct=${invoiceId}`)
  }

  const handleOpenDispute = (invoiceId: string) => {
    toast.success('Disputa iniciada', {
      description: 'Se notificó al cliente para mediación'
    })
  }

  const handleViewDetails = (invoiceId: string) => {
    router.push(`/company/${companyId}/invoices/${invoiceId}`)
  }

  if (authLoading) return null
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

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">
                {mockRejectedInvoices.length} facturas requieren atención
              </p>
              <p className="text-sm text-red-700">
                Revisa los motivos y toma las acciones necesarias
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {mockRejectedInvoices.map((invoice) => (
            <Card key={invoice.id} className="border-red-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileX className="h-5 w-5 text-red-600" />
                      {invoice.number}
                    </CardTitle>
                    <CardDescription>
                      {invoice.clientCompany} • ${invoice.total.toLocaleString()} {invoice.currency}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">Rechazada</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Rechazada por {invoice.rejectedBy}
                  </p>
                  <p className="text-sm text-red-700">{invoice.rejectionReason}</p>
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
                    onClick={() => handleCorrectInvoice(invoice.id)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Corregir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDispute(invoice.id)}
                    className="text-orange-600"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Disputar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}