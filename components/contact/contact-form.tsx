"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormFooterLink } from "@/components/ui/form-footer-link";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submission:", { name, email, subject, message });
    // Handle form submission here
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
              required
              autoComplete="name"
              className="h-12"
            />
          </div>

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
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              type="text"
              placeholder="¿Cómo podemos ayudarte?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Cuéntanos más sobre tu consulta..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="min-h-[120px] resize-none"
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Enviar Mensaje
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
