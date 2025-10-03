"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Download, Calendar, Building2, FileText, Calculator, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

// Mock invoice data with detailed information
const mockInvoiceDetails = {
  "1": {
    id: "1",
    number: "FC-001-00000123",
    type: "A",
    clientCompany: "TechCorp SA",
    clientEmail: "facturacion@techcorp.com",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    currency: "ARS",
    status: "enviada",
    paymentStatus: "pendiente",
    items: [
      {
        id: "1",
        description: "Desarrollo de aplicación web",
        quantity: 1,
        unitPrice: 100000,
        taxRate: 21,
        subtotal: 100000,
        taxAmount: 21000
      }
    ],
    perceptions: [],
    subtotal: 100000,
    totalTaxes: 21000,
    totalPerceptions: 0,
    total: 121000,
    notes: "Desarrollo completo de sistema de gestión empresarial",
    sentAt: "2024-01-15T10:30:00Z",
    sentTo: "facturacion@techcorp.com"
  },
  "2": {
    id: "2",
    number: "FC-001-00000124",
    type: "B",
    clientCompany: "StartupXYZ",
    clientEmail: "admin@startupxyz.com",
    issueDate: "2024-01-20",
    dueDate: "2024-02-20",
    currency: "ARS",
    status: "enviada",
    paymentStatus: "pendiente",
    items: [
      {
        id: "1",
        description: "Consultoría técnica",
        quantity: 10,
        unitPrice: 8500,
        taxRate: 21,
        subtotal: 85000,
        taxAmount: 17850
      }
    ],
    perceptions: [],
    subtotal: 85000,
    totalTaxes: 17850,
    totalPerceptions: 0,
    total: 102850,
    notes: "Servicios de consultoría para optimización de procesos",
    sentAt: "2024-01-20T14:15:00Z",
    sentTo: "admin@startupxyz.com"
  }
}

type InvoiceStatus = "enviada" | "aprobada"
type PaymentStatus = "pendiente" | "pagada" | "vencida" | "parcial"

export default function InvoiceDetailsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  const invoiceId = params.invoiceId as string

  const [invoice] = useState(mockInvoiceDetails[invoiceId as keyof typeof mockInvoiceDetails])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'enviada':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Enviada</Badge>
      case 'aprobada':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprobada</Badge>
    }
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'pagada':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Pagada</Badge>
      case 'vencida':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Vencida</Badge>
      case 'parcial':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Parcial</Badge>
    }
  }

  const handleDownload = () => {
    toast.success('Descarga iniciada', {
      description: `PDF de ${invoice?.number}`
    })
  }

  if (authLoading) return null
  if (!isAuthenticated) return null

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Factura no encontrada</h1>
          <Button onClick={() => router.push(`/company/${companyId}/invoices`)}>
            Volver a Facturas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/company/${companyId}/invoices`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{invoice.number}</h1>
            <p className="text-muted-foreground">Detalles de la factura</p>
          </div>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
        </div>

        {/* Invoice Header Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                Factura {invoice.type} - {invoice.number}
              </div>
              <div className="flex gap-2">
                {getStatusBadge(invoice.status as InvoiceStatus)}
                {getPaymentBadge(invoice.paymentStatus as PaymentStatus)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{invoice.clientCompany}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{invoice.clientEmail}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
                    <p className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                    <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Ítems de la Factura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoice.items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="font-medium">{item.description}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Cantidad</p>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Precio Unit.</p>
                      <p className="font-medium">${item.unitPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-bold">${item.subtotal.toLocaleString()}</p>
                      {item.taxRate > 0 && (
                        <p className="text-xs text-muted-foreground">
                          IVA {item.taxRate}%: ${item.taxAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resumen de Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">
                  ${invoice.subtotal.toLocaleString()} {invoice.currency}
                </span>
              </div>
              
              {invoice.totalTaxes > 0 && (
                <div className="flex justify-between">
                  <span>Total Impuestos:</span>
                  <span className="font-medium">
                    ${invoice.totalTaxes.toLocaleString()} {invoice.currency}
                  </span>
                </div>
              )}
              
              {invoice.totalPerceptions > 0 && (
                <div className="flex justify-between">
                  <span>Total Percepciones:</span>
                  <span className="font-medium text-orange-600">
                    ${invoice.totalPerceptions.toLocaleString()} {invoice.currency}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">
                  ${invoice.total.toLocaleString()} {invoice.currency}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sending Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Información de Envío
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Enviada el:</span>
                <span className="font-medium">
                  {new Date(invoice.sentAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Enviada a:</span>
                <span className="font-medium">{invoice.sentTo}</span>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ La factura fue enviada automáticamente por email al cliente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}