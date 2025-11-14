'use client';

import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AfipCertificateBannerProps {
  companyId: string;
  message?: string;
}

export function AfipCertificateBanner({ 
  companyId,
  message = "No puedes emitir facturas electrónicas ni sincronizar puntos de venta sin un certificado AFIP activo. Configura tu certificado para comenzar a facturar."
}: AfipCertificateBannerProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg">
      <Shield className="h-5 w-5 text-red-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">Certificado AFIP requerido</p>
        <p className="text-xs text-gray-600 mt-1">
          {message}
        </p>
      </div>
      <Button 
        type="button"
        size="sm" 
        className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
        onClick={() => router.push(`/company/${companyId}/verify`)}
      >
        Configurar Ahora
      </Button>
    </div>
  );
}
