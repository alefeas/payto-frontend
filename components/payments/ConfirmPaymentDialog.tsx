'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import paymentService, { InvoicePayment } from '@/services/payment.service';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface ConfirmPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: InvoicePayment;
  companyId: string;
  onSuccess: () => void;
}

export default function ConfirmPaymentDialog({
  open,
  onOpenChange,
  payment,
  companyId,
  onSuccess
}: ConfirmPaymentDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await paymentService.confirmPayment(companyId, payment.id);
      toast.success('Pago confirmado correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Error al confirmar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Pago</DialogTitle>
          <DialogDescription>
            ¿Confirma que el pago se efectuó correctamente?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Factura:</span>
              <span className="font-medium">
                {payment.invoice?.invoice_type} {payment.invoice?.sales_point}-{payment.invoice?.voucher_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Monto:</span>
              <span className="font-medium">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fecha de pago:</span>
              <span className="font-medium">
                {new Date(payment.payment_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Método:</span>
              <span className="font-medium capitalize">{payment.payment_method}</span>
            </div>
            {payment.reference_number && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Comprobante:</span>
                <span className="font-medium">{payment.reference_number}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'Confirmando...' : 'Confirmar Pago'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
