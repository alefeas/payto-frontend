'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { parseDateLocal } from '@/lib/utils';

interface CreditNote {
  id: string;
  number: string;
  amount: number;
  issue_date: string;
}

interface DebitNote {
  id: string;
  number: string;
  amount: number;
  issue_date: string;
}

interface BalanceBreakdown {
  original_amount: number;
  credit_notes: CreditNote[];
  total_credit_notes: number;
  debit_notes: DebitNote[];
  total_debit_notes: number;
  balance_pending: number;
}

interface BalanceBreakdownProps {
  breakdown: BalanceBreakdown;
  companyId: string;
  currency?: string;
}

export function BalanceBreakdown({ breakdown, companyId, currency = 'ARS' }: BalanceBreakdownProps) {
  const hasAdjustments = breakdown.credit_notes.length > 0 || breakdown.debit_notes.length > 0;

  if (!hasAdjustments) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base">Detalle del Saldo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="text-sm font-medium">Monto Original</span>
          <span className="text-sm font-semibold">{formatCurrency(breakdown.original_amount)}</span>
        </div>

        {breakdown.credit_notes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Notas de Crédito Aplicadas</span>
            </div>
            {breakdown.credit_notes.map((nc) => (
              <Link
                key={nc.id}
                href={`/company/${companyId}/invoices/${nc.id}`}
                className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{nc.number}</span>
                  <Badge variant="outline" className="text-xs">
                    {parseDateLocal(nc.issue_date)?.toLocaleDateString('es-AR')}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-red-600">-{formatCurrency(nc.amount)}</span>
              </Link>
            ))}
            <div className="flex items-center justify-between py-2 px-3 bg-red-100 rounded-lg">
              <span className="text-sm font-medium">Total NC</span>
              <span className="text-sm font-bold text-red-600">-{formatCurrency(breakdown.total_credit_notes)}</span>
            </div>
          </div>
        )}

        {breakdown.debit_notes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Notas de Débito Aplicadas</span>
            </div>
            {breakdown.debit_notes.map((nd) => (
              <Link
                key={nd.id}
                href={`/company/${companyId}/invoices/${nd.id}`}
                className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{nd.number}</span>
                  <Badge variant="outline" className="text-xs">
                    {parseDateLocal(nd.issue_date)?.toLocaleDateString('es-AR')}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-green-600">+{formatCurrency(nd.amount)}</span>
              </Link>
            ))}
            <div className="flex items-center justify-between py-2 px-3 bg-green-100 rounded-lg">
              <span className="text-sm font-medium">Total ND</span>
              <span className="text-sm font-bold text-green-600">+{formatCurrency(breakdown.total_debit_notes)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-3 border-t-2 border-gray-300">
          <span className="text-base font-bold">Saldo Pendiente</span>
          <span className="text-lg font-bold text-blue-600">{formatCurrency(breakdown.balance_pending)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
