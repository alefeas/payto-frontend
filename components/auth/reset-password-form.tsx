"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [hasShownSuccess, setHasShownSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setIsTokenValid(false);
    } else {
      setToken(tokenParam);
      setIsTokenValid(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("La contraseña debe contener al menos una mayúscula");
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error("La contraseña debe contener al menos una minúscula");
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error("La contraseña debe contener al menos un número");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, password);
      setTimeout(() => router.push("/log-in?reset=success"), 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al restablecer la contraseña");
      setIsLoading(false);
    }
  };

  if (isTokenValid === null) {
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
        <div className="text-center">
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
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
            <h2 className="text-lg md:text-xl lg:text-2xl font-medium">Token inválido</h2>
            <p className="text-gray-600">
              El enlace de recuperación no es válido o ha expirado.
            </p>
          </div>

          <Link href="/recuperar-contrasena" className="block">
            <Button className="w-full h-12 text-base">
              Solicitar nuevo enlace
            </Button>
          </Link>
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
          <h2 className="text-lg md:text-xl lg:text-2xl font-medium">Nueva contraseña</h2>
          <p className="text-gray-600">
            Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Mínimo 8 caracteres, incluye mayúscula, minúscula y número
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base" size="lg" disabled={isLoading}>
            {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
