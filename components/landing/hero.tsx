import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="space-y-3">
      <p className="text-primary font-medium-heading text-sm tracking-wide">
        Para empresas
      </p>

      <h1 className="text-5xl lg:text-6xl font-medium text-foreground leading-none">
        Pagos empresariales simplificados.
      </h1>

      <p className="text-muted-foreground text-lg leading-normal max-w-xl pt-1">
        Optimiza los pagos a tus proveedores y socios. Procesamiento de pagos rápido, seguro y confiable para las necesidades de tu negocio.
      </p>

      <div className="flex items-center gap-4 pt-1">
        <Button size="lg" className="cursor-pointer" asChild>
          <a href="/sign-up">Comenzar ahora</a>
        </Button>
      </div>
    </div>
  );
}

