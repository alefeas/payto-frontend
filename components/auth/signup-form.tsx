"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("¡Las contraseñas no coinciden!");
      return;
    }
    console.log("Signup attempt:", { email, password });
  };

  const handleGoogleSignup = () => {
    console.log("Google signup attempt");
  };

  return (
    <div className="w-full space-y-8">
      {/* Logo */}
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

      {/* Form */}
      <div className="space-y-6">
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="h-12"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base" size="lg">
            Registrarse
          </Button>
        </form>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
            o
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 text-base"
          size="lg"
          onClick={handleGoogleSignup}
        >
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.25 5.03 12.55C5.03 8.85 8.36 5.83 12.19 5.83C14.29 5.83 15.99 6.69 17.21 7.84L19.34 5.71C17.21 3.82 14.81 2.67 12.19 2.67C6.98 2.67 2.86 7.05 2.86 12.55C2.86 18.05 6.98 22.43 12.19 22.43C17.62 22.43 21.52 18.32 21.52 12.72C21.52 12.06 21.46 11.58 21.35 11.1Z"
              fill="#4285F4"
            />
          </svg>
          Continuar con Google
        </Button>

        <p className="text-sm text-center text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/log-in"
            className="font-medium text-primary hover:underline transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
