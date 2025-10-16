'use client';

import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AfipVerificationGuardProps {
  isVerified: boolean;
  companyId: string;
  featureName: string;
  children: React.ReactNode;
}

export function AfipVerificationGuard({ 
  isVerified, 
  companyId, 
  featureName,
  children 
}: AfipVerificationGuardProps) {
  const router = useRouter();

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-900">
              🔒 Función Bloqueada - Vista Previa
            </p>
            <p className="text-sm text-orange-800 mt-2">
              Estás viendo cómo funciona {featureName}. Para usar esta función necesitás verificar tu cuenta con AFIP.
            </p>
            <div className="mt-3 flex gap-2">
              <Button 
                type="button"
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => router.push(`/company/${companyId}/verify`)}
              >
                Verificar con AFIP
              </Button>
              <Button 
                type="button"
                size="sm"
                variant="outline"
                className="border-orange-600 text-orange-700 hover:bg-orange-50"
                onClick={() => router.push(`/company/${companyId}`)}
              >
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none opacity-60">
        {children}
      </div>
    </>
  );
}
