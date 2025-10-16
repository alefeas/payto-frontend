'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Copy, CheckCircle } from 'lucide-react';
import paymentService from '@/services/payment.service';
import { companyService } from '@/services/company.service';
import { toast } from 'sonner';

interface RegisterPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
  companyId: string;
  onSuccess: () => void;
}

interface Retention {
  type: 'vat_retention' | 'income_tax_retention' | 'gross_income_retention' | 'suss_retention';
  name: string;
  rate: number;
  amount: number;
}

export default function RegisterPaymentDialog({
  open,
  onOpenChange,
  invoice,
  companyId,
  onSuccess
}: RegisterPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [activeTab, setActiveTab] = useState('payment');
  const [retentions, setRetentions] = useState<Retention[]>([]);
  const [companyConfig, setCompanyConfig] = useState<any>(null);
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'transfer' as 'transfer' | 'check' | 'cash' | 'card',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    if (open && companyId) {
      loadCompanyConfig();
    }
  }, [open, companyId]);

  const loadCompanyConfig = async () => {
    try {
      setLoadingConfig(true);
      const company = await companyService.getCompany(companyId);
      setCompanyConfig(company);
    } catch (error) {
      console.error('Error loading company config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const calculateRetentions = (company: any) => {
    const calculatedRetentions: Retention[] = [];
    const invoiceTotal = invoice?.total || 0;
    const invoiceTaxes = invoice?.total_taxes || 0;

    // Retención IVA (sobre el IVA de la factura)
    if (company.vatRetention && company.vatRetention > 0 && invoiceTaxes > 0) {
      calculatedRetentions.push({
        type: 'vat_retention',
        name: 'Retención IVA',
        rate: company.vatRetention,
        amount: invoiceTaxes * company.vatRetention / 100
      });
    }

    // Retención Ganancias (sobre el total)
    if (company.incomeTaxRetention && company.incomeTaxRetention > 0) {
      calculatedRetentions.push({
        type: 'income_tax_retention',
        name: 'Retención Ganancias',
        rate: company.incomeTaxRetention,
        amount: invoiceTotal * company.incomeTaxRetention / 100
      });
    }

    // Retención IIBB (sobre el total)
    if (company.grossIncomeRetention && company.grossIncomeRetention > 0) {
      calculatedRetentions.push({
        type: 'gross_income_retention',
        name: 'Retención IIBB',
        rate: company.grossIncomeRetention,
        amount: invoiceTotal * company.grossIncomeRetention / 100
      });
    }

    // Retención SUSS (sobre el total)
    if (company.socialSecurityRetention && company.socialSecurityRetention > 0) {
      calculatedRetentions.push({
        type: 'suss_retention',
        name: 'Retención SUSS',
        rate: company.socialSecurityRetention,
        amount: invoiceTotal * company.socialSecurityRetention / 100
      });
    }

    setRetentions(calculatedRetentions);
  };

  const totalRetentions = retentions.reduce((sum, ret) => sum + ret.amount, 0);
  const netPayment = (invoice?.total || 0) - totalRetentions;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await paymentService.createPayment(companyId, {
        invoice_id: invoice.id,
        amount: netPayment,
        ...formData,
        status: 'confirmed',
        retentions: retentions.length > 0 ? retentions : undefined
      });

      toast.success('Pago registrado correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error registering payment:', error);
      toast.error('Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const supplier = invoice?.supplier || invoice?.issuerCompany;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Pago de Factura</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payment">Pago</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="bank">Datos Bancarios</TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Factura</p>
                    <p className="font-semibold">
                      {invoice?.type} {String(invoice?.sales_point || 0).padStart(4, '0')}-{String(invoice?.voucher_number || 0).padStart(8, '0')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Proveedor</p>
                    <p className="font-semibold">
                      {supplier?.business_name || 
                       (supplier?.first_name && supplier?.last_name 
                         ? `${supplier.first_name} ${supplier.last_name}` 
                         : 'Sin nombre')}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Factura:</span>
                    <span className="font-semibold">${(invoice?.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {retentions.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Retenciones (editables):</p>
                        {retentions.map((ret, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1 flex justify-between text-sm text-orange-600">
                              <span>{ret.name}:</span>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              max={ret.type === 'vat_retention' ? 100 : ret.type === 'income_tax_retention' ? 35 : ret.type === 'gross_income_retention' ? 5 : 2}
                              step="0.01"
                              value={ret.rate}
                              onChange={(e) => {
                                const newRetentions = [...retentions];
                                const maxRate = ret.type === 'vat_retention' ? 100 : ret.type === 'income_tax_retention' ? 35 : ret.type === 'gross_income_retention' ? 5 : 2;
                                const newRate = Math.min(parseFloat(e.target.value) || 0, maxRate);
                                newRetentions[idx] = { ...ret, rate: newRate };
                                // Recalcular amount
                                const invoiceTotal = invoice?.total || 0;
                                const invoiceTaxes = invoice?.total_taxes || 0;
                                const baseAmount = ret.type === 'vat_retention' ? invoiceTaxes : invoiceTotal;
                                newRetentions[idx].amount = baseAmount * newRate / 100;
                                setRetentions(newRetentions);
                              }}
                              className="w-20 h-8 text-sm"
                            />
                            <span className="text-sm text-orange-600 w-24 text-right">-${ret.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setRetentions(retentions.filter((_, i) => i !== idx))}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </>
                  )}
                  
                  {loadingConfig ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                    {companyConfig && !retentions.find(r => r.type === 'vat_retention') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const invoiceTaxes = invoice?.total_taxes || 0;
                          setRetentions([...retentions, {
                            type: 'vat_retention',
                            name: 'Retención IVA',
                            rate: companyConfig.vatRetention || 0,
                            amount: invoiceTaxes * (companyConfig.vatRetention || 0) / 100
                          }]);
                        }}
                      >
                        + Ret. IVA
                      </Button>
                    )}
                    {companyConfig && !retentions.find(r => r.type === 'income_tax_retention') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const invoiceTotal = invoice?.total || 0;
                          setRetentions([...retentions, {
                            type: 'income_tax_retention',
                            name: 'Retención Ganancias',
                            rate: companyConfig.incomeTaxRetention || 0,
                            amount: invoiceTotal * (companyConfig.incomeTaxRetention || 0) / 100
                          }]);
                        }}
                      >
                        + Ret. Ganancias
                      </Button>
                    )}
                    {companyConfig && !retentions.find(r => r.type === 'gross_income_retention') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const invoiceTotal = invoice?.total || 0;
                          setRetentions([...retentions, {
                            type: 'gross_income_retention',
                            name: 'Retención IIBB',
                            rate: companyConfig.grossIncomeRetention || 0,
                            amount: invoiceTotal * (companyConfig.grossIncomeRetention || 0) / 100
                          }]);
                        }}
                      >
                        + Ret. IIBB
                      </Button>
                    )}
                    {companyConfig && !retentions.find(r => r.type === 'suss_retention') && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const invoiceTotal = invoice?.total || 0;
                          setRetentions([...retentions, {
                            type: 'suss_retention',
                            name: 'Retención SUSS',
                            rate: companyConfig.socialSecurityRetention || 0,
                            amount: invoiceTotal * (companyConfig.socialSecurityRetention || 0) / 100
                          }]);
                        }}
                      >
                        + Ret. SUSS
                      </Button>
                    )}
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Neto a Pagar:</span>
                    <span className="text-green-600">${netPayment.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

          <div>
            <Label htmlFor="payment_date">Fecha de Pago *</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="payment_method">Método de Pago *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value: any) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference_number">Número de Comprobante</Label>
            <Input
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              placeholder="Ej: TRF-123456"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Registrar Pago'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número</p>
                  <p className="font-semibold">{invoice?.type} {String(invoice?.sales_point || 0).padStart(4, '0')}-{String(invoice?.voucher_number || 0).padStart(8, '0')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Emisión</p>
                  <p className="font-semibold">{invoice?.issue_date ? new Date(invoice.issue_date).toLocaleDateString('es-AR') : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vencimiento</p>
                  <p className="font-semibold">{invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString('es-AR') : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CAE</p>
                  <p className="font-semibold text-xs">{invoice?.afip_cae || 'Sin CAE'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Ítems</p>
                <div className="space-y-2">
                  {invoice?.items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-muted/50 p-3 rounded text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.description}</span>
                        <span>${(item.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.quantity} x ${(item.unit_price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })} | IVA: {item.tax_rate}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="font-semibold">${(invoice?.subtotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">IVA:</span>
                  <span className="font-semibold">${(invoice?.total_taxes || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                {invoice?.total_perceptions > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Percepciones:</span>
                    <span className="font-semibold">${(invoice.total_perceptions || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold">${(invoice?.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bank" className="space-y-4 mt-4">
            {supplier?.bank_cbu || supplier?.bank_alias ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-green-900">Datos Bancarios Disponibles</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Titular</p>
                      <p className="font-semibold">{supplier.business_name || `${supplier.first_name} ${supplier.last_name}`}</p>
                    </div>
                    
                    {supplier.bank_cbu && (
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">CBU</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(supplier.bank_cbu, 'CBU')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-mono font-semibold text-lg">{supplier.bank_cbu}</p>
                      </div>
                    )}
                    
                    {supplier.bank_alias && (
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">Alias</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(supplier.bank_alias, 'Alias')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-semibold text-lg">{supplier.bank_alias}</p>
                      </div>
                    )}
                    
                    {supplier.bank_name && (
                      <div>
                        <p className="text-sm text-muted-foreground">Banco</p>
                        <p className="font-semibold">{supplier.bank_name}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-800">
                  <p className="font-medium mb-1">💡 Monto a transferir</p>
                  <p className="text-2xl font-bold text-blue-900">${netPayment.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                  {retentions.length > 0 && (
                    <p className="text-xs mt-1">Ya descontadas las retenciones</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="font-medium mb-2">Sin datos bancarios</p>
                <p className="text-sm">Este proveedor no tiene CBU o Alias configurado.</p>
                <p className="text-sm">Configure los datos desde la sección de Proveedores.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
