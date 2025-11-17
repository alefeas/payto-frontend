"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl">
      <div className="bg-white/60 backdrop-blur-md border rounded-2xl px-6 py-4 flex items-center justify-between border-[var(--color-gray)]">
        <Link href="/" className="flex items-center gap-2 h-8">
          <Image
            src="/brand/payto.png"
            alt="Payto Logo"
            width={120}
            height={120}
            className="h-full w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Precios
          </Link>
          <Link
            href="/features"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Características
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Contacto
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/log-in"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
          >
            Iniciar sesión
          </Link>
          <Link href="/sign-up">
            <Button size="lg">Registrarse</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="h-6 w-6 text-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full min-[400px]:w-[350px] bg-white border-l p-6 border-l-[var(--color-gray)]">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">
              Navegación principal de PayTo con enlaces a Precios, Características y Contacto
            </SheetDescription>
            <div className="flex flex-col h-full mt-8">
              {/* Logo */}
              <div className="flex items-center gap-2 h-10 mb-8">
                <Image
                  src="/brand/payto.png"
                  alt="Payto Logo"
                  width={120}
                  height={120}
                  className="h-full w-auto object-contain"
                />
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-4">
                <Link
                  href="/pricing"
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Precios
                </Link>
                <Link
                  href="/features"
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Características
                </Link>
                <Link
                  href="/contact"
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Contacto
                </Link>
              </nav>

              {/* Auth Buttons */}
              <div className="flex flex-col gap-3 mt-auto pt-6 border-t border-gray-200">
                <Link href="/log-in" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full" size="lg">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/sign-up" onClick={() => setOpen(false)}>
                  <Button className="w-full" size="lg">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
