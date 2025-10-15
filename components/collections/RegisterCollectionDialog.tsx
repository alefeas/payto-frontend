'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import collectionService from '@/services/collection.service';
import { toast } from 'sonner';

interface RegisterCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
  companyId: string;
  onSuccess: () => void;
}

export default function RegisterCollectionDialog({
  open,
  onOpenChange,
  invoice,
  companyId,
  onSuccess
}: RegisterCollectionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    collection_date: new Date().toISOString().split('T')[0],
    collection_method: 'transfer' as 'transfer' | 'check' | 'cash' | 'card',
    reference_number: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await collectionService.createCollection(companyId, {
        invoice_id: invoice.id,
        amount: invoice.total,
        ...formData,
        status: 'confirmed'
      });

      toast.success('Cobro registrado correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error registering collection:', error);
      toast.error('Error al registrar el cobro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Cobro</DialogTitle>
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
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-semibold">
                {invoice?.client?.business_name || 
                 `${invoice?.client?.first_name || ''} ${invoice?.client?.last_name || ''}`.trim() || 
                 'Sin nombre'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monto</p>
              <p className="text-xl font-bold">${(invoice?.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="collection_date">Fecha de Cobro *</Label>
            <Input
              id="collection_date"
              type="date"
              value={formData.collection_date}
              onChange={(e) => setFormData({ ...formData, collection_date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="collection_method">Método de Cobro *</Label>
            <Select
              value={formData.collection_method}
              onValueChange={(value: any) => setFormData({ ...formData, collection_method: value })}
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
              {loading ? 'Guardando...' : 'Registrar Cobro'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
