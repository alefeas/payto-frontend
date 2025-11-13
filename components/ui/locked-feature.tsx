'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface LockedFeatureProps {
  title?: string;
  description?: string;
  companyId: string;
  children?: React.ReactNode;
  showOverlay?: boolean;
  className?: string;
}

export function LockedFeature({ 
  title = "Función Bloqueada", 
  description = "Esta función requiere certificado AFIP activo", 
  companyId, 
  children, 
  showOverlay = true,
  className = ""
}: LockedFeatureProps) {
  const router = useRouter();

  if (!showOverlay) {
    return (
      <div className={`opacity-50 pointer-events-none ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <Card className="max-w-md mx-4 text-center">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <div className="bg-orange-100 p-3 rounded-full">
                <Lock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => router.push(`/company/${companyId}/verify`)}
              className="w-full"
            >
              Verificar con AFIP
            </Button>
            <p className="text-xs text-muted-foreground">
              Necesitás certificado digital para usar esta función
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
