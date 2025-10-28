'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await authService.resendVerificationEmail(user.email);
      setMessage('Email de verificación enviado. Revisá tu casilla.');
    } catch (error) {
      setMessage('Error al enviar el email. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Alert className="mb-4 border-yellow-500 bg-yellow-50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Mail className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <AlertDescription className="text-yellow-800">
              <strong>Verificá tu email</strong>
              <p className="mt-1">
                Te enviamos un email de verificación a <strong>{user.email}</strong>. 
                Hacé clic en el enlace para activar todas las funcionalidades.
              </p>
              {message && (
                <p className="mt-2 text-sm font-medium">{message}</p>
              )}
              <Button
                onClick={handleResend}
                disabled={loading}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                {loading ? 'Enviando...' : 'Reenviar email'}
              </Button>
            </AlertDescription>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-600 hover:text-yellow-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
}
