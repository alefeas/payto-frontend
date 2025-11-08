"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setEmailSent(true);
      toast.success("Correo enviado. Revisa tu bandeja de entrada.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al enviar el correo");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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

        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Revisa tu correo</h2>
            <p className="text-gray-600">
              Hemos enviado un enlace de recuperación a <span className="font-medium">{email}</span>
            </p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => setEmailSent(false)}
            >
              Enviar de nuevo
            </Button>

            <Link href="/log-in" className="block">
              <Button variant="ghost" className="w-full" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
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
          <h2 className="text-2xl font-semibold">¿Olvidaste tu contraseña?</h2>
          <p className="text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu cuenta.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-12"
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
        </form>

        <Link href="/log-in" className="block">
          <Button variant="ghost" className="w-full" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio de sesión
          </Button>
        </Link>
      </div>
    </div>
  );
}
