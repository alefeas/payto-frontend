"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormFooterLink } from "@/components/ui/form-footer-link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!email.trim()) {
      toast.error("El email es obligatorio");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor ingresa un email válido");
      return;
    }
    if (!message.trim()) {
      toast.error("El mensaje es obligatorio");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("El mensaje debe tener al menos 10 caracteres");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post("/contact", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al enviar el mensaje";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="text"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Cuéntanos más sobre tu consulta..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              disabled={loading}
              maxLength={1000}
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">Mínimo 10 caracteres</p>
              <p className={`text-xs font-medium ${message.length >= 1000 ? 'text-blue-600' : 'text-gray-500'}`}>
                {message.length} / 1000
              </p>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base" 
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Mensaje"
            )}
          </Button>
        </form>

        <FormFooterLink
          text="¿Necesitas ayuda inmediata?"
          linkText="Escríbenos directamente"
          href="mailto:support@payto.com"
        />
      </div>
    </div>
  );
}
