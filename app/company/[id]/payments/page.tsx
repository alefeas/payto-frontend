'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, CheckCircle, ArrowLeft, Loader2, CreditCard, Eye, Info } from 'lucide-react';
import paymentService, { InvoicePayment } from '@/services/payment.service';
import { invoiceService } from '@/services/invoice.service';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import RegisterPaymentDialog from '@/components/payments/RegisterPaymentDialog';


export default function PaymentsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [activeTab, setActiveTab] = useState('pending');
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [paidPayments, setPaidPayments] = useState<InvoicePayment[]>([]);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);


  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pending invoices (approved, not paid, RECIBIDAS por esta empresa)
      const response = await invoiceService.getInvoices(companyId, 'approved');
      const invoices = response.data || response;
      console.log('PAYMENTS - All:', invoices);
      console.log('PAYMENTS - CompanyId:', companyId);
      const filtered = Array.isArray(invoices) ? invoices.filter((inv: any) => {
        console.log(`Invoice ${inv.id}: receiver=${inv.receiver_company_id}, issuer=${inv.issuer_company_id}`);
        const match = inv.status === 'approved' && inv.receiver_company_id === companyId;
        if (match) console.log('PAYMENT Invoice MATCHED:', inv.id, 'Supplier:', inv.supplier);
        return match;
      }) : [];
      console.log('PAYMENTS - Filtered:', filtered);
      setPendingInvoices(filtered);

      // Load paid payments
      const allPayments = await paymentService.getPayments(companyId);
      setPaidPayments(allPayments.filter(p => p.status === 'confirmed'));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTxt = () => {
    if (selectedInvoices.length === 0) {
      toast.error('Seleccione al menos una factura');
      return;
    }

    try {
      // Validar que todos los proveedores tengan CBU o Alias
      const selectedInvoiceData = pendingInvoices.filter(inv => selectedInvoices.includes(inv.id));
      const missingData = selectedInvoiceData.filter(inv => !inv.supplier?.bank_cbu && !inv.supplier?.bank_alias);
      
      if (missingData.length > 0) {
        toast.error('Algunos proveedores no tienen datos bancarios', {
          description: `${missingData.length} factura(s) sin CBU o Alias. Configure los datos bancarios primero.`
        });
        return;
      }

      // Generar contenido TXT (formato homebanking)
      const lines = selectedInvoiceData.map(invoice => {
        const supplier = invoice.supplier;
        const reference = `Factura ${invoice.type} ${String(invoice.sales_point).padStart(4, '0')}-${String(invoice.voucher_number).padStart(8, '0')}`;
        const name = supplier.business_name || `${supplier.first_name} ${supplier.last_name}`;
        const destination = supplier.bank_cbu || supplier.bank_alias;
        
        // Formato: CBU/Alias|Monto|Referencia|Nombre
        return `${destination}|${invoice.total.toFixed(2)}|${reference}|${name}`;
      });

      const txtContent = lines.join('\n');
      const filename = `pagos_${new Date().toISOString().split('T')[0]}.txt`;

      // Descargar archivo
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Archivo TXT generado: ${filename}`, {
        description: `${selectedInvoices.length} pago(s) incluido(s)`
      });
      setSelectedInvoices([]);
    } catch (error: any) {
      console.error('Error generating TXT:', error);
      toast.error('Error al generar archivo TXT');
    }
  };

  const handleRegisterPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setRegisterDialogOpen(true);
  };

  const handlePaymentRegistered = () => {
    setRegisterDialogOpen(false);
    setSelectedInvoice(null);
    loadData();
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push(`/company/${companyId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Pagar Facturas</h1>
            <p className="text-muted-foreground">Gestiona el pago de facturas recibidas de proveedores</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-blue-900 text-sm">¿Cómo funciona?</p>
              <ul className="text-xs text-blue-800 mt-2 space-y-1">
                <li>• <strong>Ver Detalles:</strong> Revisa ítems, totales y datos bancarios del proveedor</li>
                <li>• <strong>Registrar Pago:</strong> Marca facturas como pagadas con retenciones automáticas</li>
                <li>• <strong>Archivo Homebanking:</strong> Genera TXT con múltiples pagos para tu banco</li>
                <li>• <strong>Retenciones:</strong> Se calculan según tu configuración fiscal (IVA, Ganancias, IIBB, SUSS)</li>
              </ul>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestión de Pagos</CardTitle>
                <CardDescription>
                  Selecciona facturas para pagar individualmente o generar archivo bancario
                </CardDescription>
              </div>
              <Button onClick={handleGenerateTxt} disabled={selectedInvoices.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Generar TXT {selectedInvoices.length > 0 && `(${selectedInvoices.length})`}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">
                  Por Pagar ({pendingInvoices.length})
                </TabsTrigger>
                <TabsTrigger value="paid">
                  Pagadas ({paidPayments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-4">

                {pendingInvoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay facturas pendientes de pago</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingInvoices.map((invoice) => {
                      const supplierName = invoice.supplier?.business_name || 
                        (invoice.supplier?.first_name && invoice.supplier?.last_name 
                          ? `${invoice.supplier.first_name} ${invoice.supplier.last_name}` 
                          : 'Proveedor sin nombre');
                      
                      return (
                        <Card 
                          key={invoice.id} 
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={(e) => {
                            if (!(e.target as HTMLElement).closest('button')) {
                              toggleInvoiceSelection(invoice.id);
                            }
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedInvoices.includes(invoice.id)}
                                onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {invoice.type} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                                  </span>
                                  {(invoice.supplier?.bank_cbu || invoice.supplier?.bank_alias) ? (
                                    <Badge variant="outline" className="text-xs h-5 text-green-600 border-green-600">✓ Datos bancarios</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs h-5 text-amber-600 border-amber-600">⚠ Sin datos bancarios</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">{supplierName}</p>
                                {(invoice.supplier?.bank_cbu || invoice.supplier?.bank_alias) && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    {invoice.supplier.bank_alias || invoice.supplier.bank_cbu}
                                  </p>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-sm">{formatCurrency(invoice.total || 0)}</p>
                                <p className="text-xs text-muted-foreground">
                                  Vto: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('es-AR') : '-'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRegisterPayment(invoice)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRegisterPayment(invoice)}
                                >
                                  Pagar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="paid" className="space-y-4 mt-4">
                {paidPayments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay pagos confirmados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paidPayments.map((payment) => {
                      const invoiceNumber = payment.invoice ? 
                        `${payment.invoice.type || 'N/A'} ${String(payment.invoice.sales_point || 0).padStart(4, '0')}-${String(payment.invoice.voucher_number || 0).padStart(8, '0')}` : 
                        'Sin número';
                      
                      return (
                        <Card key={payment.id}>
                          <CardContent className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm">Factura {invoiceNumber}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('es-AR') : 'Sin fecha'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-sm">{formatCurrency(payment.amount || 0)}</p>
                                <Badge variant="outline" className="text-xs h-5 text-green-600 border-green-600">Pagada</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {selectedInvoice && (
          <RegisterPaymentDialog
            open={registerDialogOpen}
            onOpenChange={setRegisterDialogOpen}
            invoice={selectedInvoice}
            companyId={companyId}
            onSuccess={handlePaymentRegistered}
          />
        )}
      </div>
    </div>
  );
}
