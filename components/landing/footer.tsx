import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div>
              <div className="h-8 flex items-start mb-4">
                <Image
                  src="/brand/payto.png"
                  alt="Payto Logo"
                  width={120}
                  height={32}
                  className="h-full w-auto object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plataforma especializada en facturación electrónica con ARCA y pago a proveedores.
              </p>
            </div>

            {/* Características */}
            <div>
              <div className="h-8 flex items-start mb-4">
                <h3 className="font-medium text-sm text-foreground">Características</h3>
              </div>
              <nav className="flex flex-col space-y-3">
                <a
                  href="/features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Facturación
                </a>
                <a
                  href="/features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Red PayTo
                </a>
              </nav>
            </div>

            {/* Soporte */}
            <div>
              <div className="h-8 flex items-start mb-4">
                <h3 className="font-medium text-sm text-foreground">Soporte</h3>
              </div>
              <nav className="flex flex-col space-y-3">
                <a
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Preguntas Frecuentes
                </a>
                <a
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Contacto
                </a>
                <a
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  0800-444-2222
                </a>
              </nav>
            </div>

            {/* Legal */}
            <div>
              <div className="h-8 flex items-start mb-4">
                <h3 className="font-medium text-sm text-foreground">Legal</h3>
              </div>
              <nav className="flex flex-col space-y-3">
                <a
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Política de Privacidad
                </a>
                <a
                  href="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
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
