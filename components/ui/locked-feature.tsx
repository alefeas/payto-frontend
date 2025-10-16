'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface LockedFeatureProps {
  title: string;
  description: string;
  companyId: string;
  children?: React.ReactNode;
}

export function LockedFeature({ title, description, companyId, children }: LockedFeatureProps) {
  const router = useRouter();

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push(`/company/${companyId}/verify`)}
              className="w-full"
            >
              Verificar con AFIP
            </Button>
            <p className="text-xs text-muted-foreground">
              Necesitás certificado digital para usar esta función
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
