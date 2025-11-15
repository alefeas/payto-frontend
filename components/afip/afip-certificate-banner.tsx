'use client';

import { Shield } from 'lucide-react';

interface AfipCertificateBannerProps {
  companyId: string;
  message?: string;
}

export function AfipCertificateBanner({ 
  companyId,
  message = "No puedes emitir facturas electrónicas ni sincronizar puntos de venta sin un certificado AFIP activo. Configura tu certificado para comenzar a facturar."
}: AfipCertificateBannerProps) {
  return (
    <div className="flex items-start gap-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
      <Shield className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">Certificado AFIP requerido</p>
        <p className="text-xs text-gray-600 mt-1">
          {message}
        </p>
      </div>
    </div>
  );
}
