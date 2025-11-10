export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          {/* Descripción y Copyright */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground max-w-xs">
              Simplificamos los pagos empresariales con soluciones seguras y eficientes para tu negocio.
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 PayTo. Todos los derechos reservados.
            </p>
          </div>

          {/* Navegación y Legal */}
          <div className="flex gap-16">
            {/* Navegación */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground">Navegación</h3>
              <nav className="flex flex-col space-y-3">
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Inicio
                  </span>
                </a>
                <a
                  href="/features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Características
                  </span>
                </a>
                <a
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Precios
                  </span>
                </a>
                <a
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Contacto
                  </span>
                </a>
                <a
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Preguntas Frecuentes
                  </span>
                </a>
              </nav>
            </div>

            {/* Enlaces legales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-foreground">Legal</h3>
              <nav className="flex flex-col space-y-3">
                <a
                  href="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Términos de Servicio
                  </span>
                </a>
                <a
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Política de Privacidad
                  </span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
