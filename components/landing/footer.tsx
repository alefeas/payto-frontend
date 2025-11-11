import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo and Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 h-8">
                <Image
                  src="/brand/payto.png"
                  alt="Payto Logo"
                  width={120}
                  height={120}
                  className="h-full w-auto object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Simplificamos los pagos empresariales con soluciones seguras y eficientes.
              </p>
            </div>

            {/* Características */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-foreground">Características</h3>
              <nav className="flex flex-col space-y-2">
                <a
                  href="/features"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Facturación
                </a>
                <a
                  href="/features"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Cuentas
                </a>
                <a
                  href="/features"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Red PayTo
                </a>
                <a
                  href="/pricing"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Precios
                </a>
              </nav>
            </div>

            {/* Soporte */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-foreground">Soporte</h3>
              <nav className="flex flex-col space-y-2">
                <a
                  href="/faq"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Preguntas Frecuentes
                </a>
                <a
                  href="/contact"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Contacto
                </a>
              </nav>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-foreground">Legal</h3>
              <nav className="flex flex-col space-y-2">
                <a
                  href="/privacy-policy"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Política de Privacidad
                </a>
                <a
                  href="/terms-of-service"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Términos de Servicio
                </a>
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 mt-8">
            <p className="pt-8 text-xs text-muted-foreground text-center">
              © 2025 PayTo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
