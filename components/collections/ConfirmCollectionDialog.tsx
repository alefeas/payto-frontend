'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import collectionService, { InvoiceCollection } from '@/services/collection.service';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

interface ConfirmCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: InvoiceCollection;
  companyId: string;
  onSuccess: () => void;
}

export default function ConfirmCollectionDialog({
  open,
  onOpenChange,
  collection,
  companyId,
  onSuccess
}: ConfirmCollectionDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await collectionService.confirmCollection(companyId, collection.id);
      toast.success('Cobro confirmado correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error confirming collection:', error);
      toast.error('Error al confirmar el cobro');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);

    try {
      await collectionService.rejectCollection(companyId, collection.id);
      toast.success('Cobro rechazado');
      onSuccess();
    } catch (error) {
      console.error('Error rejecting collection:', error);
      toast.error('Error al rechazar el cobro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Cobro</DialogTitle>
          <DialogDescription>
            {collection.from_network 
              ? '¿Confirma que recibió este pago registrado por el cliente?'
              : '¿Confirma que el cobro se efectuó correctamente?'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Factura:</span>
              <span className="font-medium">
                {collection.invoice?.invoice_type} {collection.invoice?.sales_point}-{collection.invoice?.voucher_number}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Monto:</span>
              <span className="font-medium">{formatCurrency(collection.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fecha de cobro:</span>
              <span className="font-medium">
                {new Date(collection.collection_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Método:</span>
              <span className="font-medium capitalize">{collection.collection_method}</span>
            </div>
            {collection.reference_number && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Comprobante:</span>
                <span className="font-medium">{collection.reference_number}</span>
              </div>
            )}
            {collection.from_network && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Origen:</span>
                <span className="font-medium text-blue-600">Red Empresarial</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            {collection.from_network && (
              <Button variant="destructive" onClick={handleReject} disabled={loading}>
                Rechazar
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'Confirmando...' : 'Confirmar Cobro'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
