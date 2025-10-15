'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Loader2, Eye } from 'lucide-react';
import collectionService, { InvoiceCollection } from '@/services/collection.service';
import { invoiceService } from '@/services/invoice.service';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import RegisterCollectionDialog from '@/components/collections/RegisterCollectionDialog';


export default function CollectionsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [activeTab, setActiveTab] = useState('pending');
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);
  const [collectedInvoices, setCollectedInvoices] = useState<InvoiceCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pending invoices (approved, not paid, EMITIDAS por esta empresa)
      const response = await invoiceService.getInvoices(companyId, 'approved');
      const invoices = response.data || response;
      console.log('COLLECTIONS - All:', invoices);
      const filtered = Array.isArray(invoices) ? invoices.filter((inv: any) => {
        const match = inv.status === 'approved' && inv.issuer_company_id === companyId && inv.receiver_company_id !== companyId;
        if (match) console.log('COLLECTION Invoice:', inv.id, 'Client:', inv.client);
        return match;
      }) : [];
      console.log('COLLECTIONS - Filtered:', filtered);
      setPendingInvoices(filtered);

      // Load collected invoices
      const allCollections = await collectionService.getCollections(companyId);
      setCollectedInvoices(allCollections.filter(c => c.status === 'confirmed'));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCollection = (invoice: any) => {
    setSelectedInvoice(invoice);
    setRegisterDialogOpen(true);
  };

  const handleCollectionRegistered = () => {
    setRegisterDialogOpen(false);
    setSelectedInvoice(null);
    loadData();
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
            <h1 className="text-3xl font-bold">Cobrar Facturas</h1>
            <p className="text-muted-foreground">Facturas emitidas pendientes de cobro</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Cobros</CardTitle>
            <CardDescription>
              Registra los cobros recibidos de tus clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">
                  Por Cobrar ({pendingInvoices.length})
                </TabsTrigger>
                <TabsTrigger value="collected">
                  Cobradas ({collectedInvoices.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingInvoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay facturas pendientes de cobro</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingInvoices.map((invoice) => {
                      const clientName = invoice.client?.business_name || 
                        (invoice.client?.first_name && invoice.client?.last_name 
                          ? `${invoice.client.first_name} ${invoice.client.last_name}` 
                          : 'Cliente sin nombre');
                      
                      return (
                        <Card 
                          key={invoice.id} 
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={(e) => {
                            if (!(e.target as HTMLElement).closest('button')) {
                              handleRegisterCollection(invoice);
                            }
                          }}
                        >
                          <CardContent className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {invoice.type || 'N/A'} {String(invoice.sales_point || 0).padStart(4, '0')}-{String(invoice.voucher_number || 0).padStart(8, '0')}
                                </p>
                                <p className="text-xs text-muted-foreground">{clientName}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-sm">{formatCurrency(invoice.total || 0)}</p>
                                <p className="text-xs text-muted-foreground">
                                  Vto: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('es-AR') : '-'}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRegisterCollection(invoice);
                                }}
                              >
                                Registrar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="collected" className="space-y-4 mt-4">
                {collectedInvoices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay cobros confirmados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {collectedInvoices.map((collection) => {
                      const invoiceNumber = collection.invoice ? 
                        `${collection.invoice.type || 'N/A'} ${String(collection.invoice.sales_point || 0).padStart(4, '0')}-${String(collection.invoice.voucher_number || 0).padStart(8, '0')}` : 
                        'Sin número';
                      
                      return (
                        <Card key={collection.id}>
                          <CardContent className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm">Factura {invoiceNumber}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {collection.collection_date ? new Date(collection.collection_date).toLocaleDateString('es-AR') : 'Sin fecha'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-sm">{formatCurrency(collection.amount || 0)}</p>
                                <Badge variant="outline" className="text-xs h-5 text-green-600 border-green-600">Cobrada</Badge>
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
          <RegisterCollectionDialog
            open={registerDialogOpen}
            onOpenChange={setRegisterDialogOpen}
            invoice={selectedInvoice}
            companyId={companyId}
            onSuccess={handleCollectionRegistered}
          />
        )}
      </div>
    </div>
  );
}
