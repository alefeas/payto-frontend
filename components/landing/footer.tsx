export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Términos de Servicio
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Política de Privacidad
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Contáctanos
            </a>
          </nav>
          <p className="text-sm text-muted-foreground">
            © 2023 payto. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

