import { Button } from "@/components/ui/button";
import AnimatedHeroContent from "./animated-hero-content";

const heroContents = [
  {
    title: "Gestioná los pagos a tus proveedores.",
    description: "Aplicación desarrollada para el control, seguimiento y gestión del pago de facturas a proveedores, permitiendo optimizar los procesos administrativos.",
  },
  {
    title: "Facturación electrónica con ARCA.",
    description: "Plataforma especializada para gestionar facturación electrónica, emisión de comprobantes y libro IVA. Integración directa con ARCA.",
  },
];

export default function Hero() {
  return (
    <div className="space-y-3">
      <p className="text-primary font-light-heading text-sm tracking-wide">
        Para monotributistas y empresas
      </p>

      <AnimatedHeroContent contents={heroContents} />

      <div className="flex items-center gap-4 pt-1">
        <Button size="lg" className="cursor-pointer" asChild>
          <a href="/sign-up">Comenzar ahora</a>
        </Button>
      </div>
    </div>
  );
}
