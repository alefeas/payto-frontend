'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no encontrado');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      await authService.verifyEmail(token);
      setStatus('success');
      setMessage('¡Email verificado correctamente!');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Error al verificar el email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-600" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-red-600" />}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Verificando email...'}
            {status === 'success' && '¡Verificación exitosa!'}
            {status === 'error' && 'Error de verificación'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <Button onClick={() => router.push('/login')} className="w-full">
              Ir al Login
            </Button>
          )}
          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={() => router.push('/login')} className="w-full">
                Volver al Login
              </Button>
              <Button onClick={() => router.push('/register')} variant="outline" className="w-full">
                Registrarse nuevamente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
