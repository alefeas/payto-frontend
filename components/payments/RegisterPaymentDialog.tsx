'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import paymentService from '@/services/payment.service';
import { toast } from 'sonner';

interface RegisterPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
  companyId: string;
  onSuccess: () => void;
}

export default function RegisterPaymentDialog({
  open,
  onOpenChange,
  invoice,
  companyId,
  onSuccess
}: RegisterPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'transfer' as 'transfer' | 'check' | 'cash' | 'card',
    reference_number: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await paymentService.createPayment(companyId, {
        invoice_id: invoice.id,
        amount: invoice.total,
        ...formData,
        status: 'confirmed'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Factura</p>
              <p className="font-semibold">
                {invoice?.type} {String(invoice?.sales_point || 0).padStart(4, '0')}-{String(invoice?.voucher_number || 0).padStart(8, '0')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proveedor</p>
              <p className="font-semibold">
                {invoice?.supplier?.business_name || 
                 (invoice?.supplier?.first_name && invoice?.supplier?.last_name 
                   ? `${invoice.supplier.first_name} ${invoice.supplier.last_name}` 
                   : null) ||
                 invoice?.issuerCompany?.business_name || 
                 invoice?.issuerCompany?.name || 
                 'Sin nombre'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monto</p>
              <p className="text-xl font-bold">${(invoice?.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
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
      </DialogContent>
    </Dialog>
  );
}
