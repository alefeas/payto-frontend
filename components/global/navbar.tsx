import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl">
      <div className="bg-white/60 backdrop-blur-md border border-[#eeeeee] rounded-2xl px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 h-8">
          <Image
            src="/brand/payto.png"
            alt="Payto Logo"
            width={120}
            height={120}
            className="h-full w-auto object-contain"
          />
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="/pricing"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Precios
          </a>
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Características
          </a>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/log-in"
            className="text-muted-foreground hover:text-foreground transition-colors font-medium cursor-pointer"
          >
            Iniciar sesión
          </a>
          <a href="/sign-up">
            <Button size="lg">Registrarse</Button>
          </a>
        </div>
      </div>
    </nav>
  );
}
