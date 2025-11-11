import Navbar from "@/components/global/navbar";
import Footer from "@/components/landing/footer";

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-medium text-foreground mb-4">
            Términos de Servicio
          </h1>
          <p className="text-muted-foreground mb-12">
            Última actualización: 9 de noviembre de 2025
          </p>

          <div className="space-y-8 text-foreground">
              <section>
                <h2 className="text-2xl font-medium mb-4">1. Aceptación de los Términos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Al acceder y utilizar PayTo, usted acepta estar sujeto a estos Términos de Servicio y todas las leyes 
                  y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestro servicio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">2. Descripción del Servicio</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  PayTo proporciona una plataforma especializada en facturación electrónica con ARCA que incluye:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Facturación electrónica y emisión de comprobantes ARCA</li>
                  <li>Gestión de cuentas por cobrar y por pagar</li>
                  <li>Integración directa con ARCA y cumplimiento de obligaciones fiscales</li>
                  <li>Gestión de proveedores y clientes</li>
                  <li>Generación automática de libro IVA y reportes fiscales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">3. Registro y Cuenta de Usuario</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Para utilizar nuestros servicios, debe:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Proporcionar información precisa y completa durante el registro</li>
                  <li>Mantener la seguridad de su contraseña y cuenta</li>
                  <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                  <li>Ser mayor de 18 años o tener autorización legal para operar</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">4. Uso Aceptable</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Usted se compromete a NO utilizar el servicio para:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Actividades ilegales o fraudulentas</li>
                  <li>Violar derechos de propiedad intelectual</li>
                  <li>Distribuir malware o contenido dañino</li>
                  <li>Interferir con el funcionamiento del servicio</li>
                  <li>Realizar ingeniería inversa o intentar acceder a sistemas no autorizados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">5. Propiedad Intelectual</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Todos los derechos, títulos e intereses en y para el servicio, incluyendo el software, diseños, 
                  marcas registradas y contenido, son y seguirán siendo propiedad exclusiva de PayTo. Usted retiene 
                  todos los derechos sobre sus datos y contenido cargado en la plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">6. Facturación y Pagos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Los planes de pago se facturan mensualmente según el plan seleccionado. Los precios están sujetos 
                  a cambios con notificación previa de 30 días. Los cargos no son reembolsables excepto cuando lo 
                  requiera la ley aplicable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">7. Protección de Datos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nos comprometemos a proteger sus datos de acuerdo con nuestra Política de Privacidad y las leyes 
                  aplicables, incluyendo la Ley de Protección de Datos Personales de Argentina (Ley 25.326). 
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">8. Limitación de Responsabilidad</h2>
                <p className="text-muted-foreground leading-relaxed">
                  PayTo no será responsable por daños indirectos, incidentales, especiales o consecuentes que surjan 
                  del uso o la incapacidad de usar el servicio. Nuestra responsabilidad total no excederá el monto 
                  pagado por usted en los últimos 12 meses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">9. Modificaciones del Servicio</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nos reservamos el derecho de modificar, suspender o descontinuar cualquier parte del servicio en 
                  cualquier momento. Haremos esfuerzos razonables para notificarle sobre cambios significativos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">10. Terminación</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos terminar o suspender su acceso al servicio inmediatamente, sin previo aviso, por cualquier 
                  motivo, incluyendo el incumplimiento de estos Términos. Usted puede cancelar su cuenta en cualquier 
                  momento desde la configuración de su perfil.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-medium mb-4">11. Ley Aplicable</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será resuelta 
                  en los tribunales competentes de Argentina.
                </p>
              </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

