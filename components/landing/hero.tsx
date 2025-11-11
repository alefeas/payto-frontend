import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="space-y-3">
      <p className="text-primary font-medium-heading text-sm tracking-wide">
        Para contadores y empresas
      </p>

      <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium text-foreground leading-none">
        Facturación electrónica con ARCA.
      </h1>

      <p className="text-muted-foreground text-sm md:text-base lg:text-lg leading-normal max-w-xl pt-1">
        Plataforma especializada para gestionar facturación electrónica, emisión de comprobantes y libro IVA. Integración directa con ARCA para estudios contables y empresas argentinas.
      </p>

      <div className="flex items-center gap-4 pt-1">
        <Button size="lg" className="cursor-pointer" asChild>
          <a href="/sign-up">Comenzar ahora</a>
        </Button>
      </div>
    </div>
  );
}
