"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/contexts/auth-context";

export default function VerifyAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthToken } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [expirationTimer, setExpirationTimer] = useState(600);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const savedEmail = sessionStorage.getItem('pendingEmail');
    
    if (emailParam) {
      setEmail(emailParam);
      sessionStorage.setItem('pendingEmail', emailParam);
      sessionStorage.setItem('codeTimestamp', Date.now().toString());
    } else if (savedEmail) {
      setEmail(savedEmail);
    } else {
      toast.error('No hay un registro pendiente');
      router.push('/sign-up');
      return;
    }

    inputRefs.current[0]?.focus();
    startResendTimer();
  }, [searchParams, router]);

  useEffect(() => {
    if (!email) return;

    const timestamp = sessionStorage.getItem('codeTimestamp');
    if (timestamp) {
      const elapsed = Math.floor((Date.now() - parseInt(timestamp)) / 1000);
      const remaining = Math.max(0, 600 - elapsed);
      setExpirationTimer(remaining);
    }

    const interval = setInterval(() => {
      setExpirationTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const nextEmptyIndex = newCode.findIndex((digit) => !digit);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      toast.error("Por favor ingresa el código completo");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.verifyCode(email, verificationCode);
      await setAuthToken(result.data.token);
      sessionStorage.removeItem('pendingEmail');
      sessionStorage.removeItem('codeTimestamp');
      toast.success('¡Cuenta creada exitosamente!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Código incorrecto');
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isResending) return;
    
    setIsResending(true);
    try {
      await authService.resendCode(email);
      toast.success('Nuevo código enviado');
      setCode(["", "", "", "", "", ""]);
      setExpirationTimer(600);
      sessionStorage.setItem('codeTimestamp', Date.now().toString());
      startResendTimer();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al reenviar código');
    } finally {
      setIsResending(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!email) {
    return null;
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-block">
          <Image
            src="/brand/payto.png"
            alt="Payto Logo"
            width={160}
            height={160}
            className="object-contain hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>

      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Verifica tu cuenta</h2>
          <p className="text-gray-600">
            Ingresa el código de 6 dígitos enviado a<br />
            <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-center block">Código de verificación</Label>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-semibold"
                  disabled={isLoading}
                />
              ))}
            </div>
            <div className={`flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-lg ${
              expirationTimer === 0 ? 'bg-red-50 text-red-600' :
              expirationTimer < 60 ? 'bg-orange-50 text-orange-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {expirationTimer === 0 ? (
                'Código expirado'
              ) : (
                `Expira en ${Math.floor(expirationTimer / 60)}:${String(expirationTimer % 60).padStart(2, '0')}`
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            size="lg"
            disabled={isLoading || code.some((digit) => !digit)}
          >
            {isLoading ? "Verificando..." : "Verificar cuenta"}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            ¿No recibiste el código?{" "}
            <Button
              type="button"
              variant="outline"
              onClick={handleResendCode}
              disabled={resendTimer > 0 || isResending}
              className="w-full"
            >
              {isResending ? (
                'Reenviando...'
              ) : resendTimer > 0 ? (
                `Reenviar en ${resendTimer}s`
              ) : (
                'Reenviar código'
              )}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
