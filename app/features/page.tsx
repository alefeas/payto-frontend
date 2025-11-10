import Navbar from "@/components/global/navbar";
import Footer from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Network, 
  Shield, 
  BarChart3, 
  Clock, 
  CreditCard, 
  FileCheck, 
  Building2, 
  CheckCircle, 
  Zap 
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Facturación Electrónica",
    description: "Emite facturas electrónicas conformes a AFIP de forma rápida y sencilla. Compatible con todos los tipos de comprobantes."
  },
  {
    icon: TrendingUp,
    title: "Cuentas por Cobrar",
    description: "Gestiona y monitorea todos tus cobros pendientes. Mantén el control de tu flujo de caja y mejora la cobranza."
  },
  {
    icon: CreditCard,
    title: "Cuentas por Pagar",
    description: "Administra tus proveedores y pagos pendientes. Programa pagos y evita recargos por vencimientos."
  },
  {
    icon: Users,
    title: "Gestión de Clientes",
    description: "Centraliza toda la información de tus clientes. Historial de transacciones y análisis de comportamiento."
  },
  {
    icon: Building2,
    title: "Gestión de Proveedores",
    description: "Organiza tus proveedores y sus facturas. Mantén un registro completo de todas las operaciones."
  },
  {
    icon: Network,
    title: "Red PayTo",
    description: "Conéctate con otros usuarios de PayTo para automatizar el intercambio de comprobantes y simplificar procesos."
  },
  {
    icon: Shield,
    title: "Integración AFIP",
    description: "Conexión directa con AFIP para validar certificados, consultar padrón y cumplir con todas las obligaciones fiscales."
  },
  {
    icon: BarChart3,
    title: "Reportes y Análisis",
    description: "Obtén informes detallados de tu actividad comercial. Visualiza métricas clave para tomar mejores decisiones."
  },
  {
    icon: FileCheck,
    title: "Libro IVA Automático",
    description: "Genera tu libro IVA de forma automática con todas las facturas registradas. Exporta en formatos compatibles."
  },
  {
    icon: CheckCircle,
    title: "Aprobación de Facturas",
    description: "Sistema de flujo de trabajo para aprobar facturas antes de su emisión. Control total sobre la documentación."
  },
  {
    icon: Clock,
    title: "Historial y Auditoría",
    description: "Registro completo de todas las operaciones realizadas. Trazabilidad total para auditorías y controles."
  },
  {
    icon: Zap,
    title: "Procesamiento Rápido",
    description: "Plataforma optimizada para procesar grandes volúmenes de facturas de forma eficiente y sin demoras."
  }
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Características de PayTo
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Todo lo que necesitas para gestionar tu empresa de forma profesional y eficiente. 
              Una plataforma completa diseñada para empresas argentinas.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Únete a las empresas que ya están optimizando su gestión empresarial con PayTo. 
              Comienza gratis hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/sign-up">
                <Button size="lg">Crear cuenta gratis</Button>
              </a>
              <a href="/contact">
                <Button size="lg" variant="outline">Contactar ventas</Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

