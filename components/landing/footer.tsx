import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div>
              <Link href="/">
                <div className="h-8 flex items-start mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                  <Image
                    src="/brand/payto.png"
                    alt="Payto Logo"
                    width={120}
                    height={32}
                    className="h-full w-auto object-contain"
                  />
                </div>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plataforma especializada en facturación electrónica con ARCA y pago a proveedores.
              </p>
            </div>

            {/* Navegación */}
            <div>
              <div className="h-8 flex items-start mb-4">
                <h3 className="font-medium text-sm text-foreground">Navegación</h3>
              </div>
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Inicio
                </Link>
                <Link
                  href="/features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Características
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Precios
                </Link>
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
