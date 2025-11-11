import Navbar from "@/components/global/navbar";
import Footer from "@/components/landing/footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-4">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground mb-12">
            Última actualización: 9 de noviembre de 2025
          </p>

          <div className="space-y-8 text-foreground">
              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">1. Introducción</h2>
                <p className="text-muted-foreground leading-relaxed">
                  En PayTo, respetamos su privacidad y nos comprometemos a proteger sus datos personales. Esta Política 
                  de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos su información en cumplimiento 
                  con la Ley 25.326 de Protección de Datos Personales de Argentina y otras regulaciones aplicables.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">2. Información que Recopilamos</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Recopilamos la siguiente información:
                </p>
                
                <h3 className="text-base md:text-lg font-medium mt-4 mb-2">2.1 Información de Registro</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Nombre completo y datos de contacto</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Información fiscal (CUIT/CUIL)</li>
                </ul>

                <h3 className="text-base md:text-lg font-medium mt-4 mb-2">2.2 Información de la Empresa</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Razón social y datos fiscales</li>
                  <li>Domicilio fiscal</li>
                  <li>Certificados AFIP</li>
                  <li>Información de facturación</li>
                </ul>

                <h3 className="text-base md:text-lg font-medium mt-4 mb-2">2.3 Información de Uso</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Direcciones IP y datos de navegación</li>
                  <li>Información del dispositivo y navegador</li>
                  <li>Páginas visitadas y tiempo de uso</li>
                  <li>Registros de actividad del sistema</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">3. Cómo Utilizamos su Información</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Utilizamos sus datos personales para:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Proporcionar y mantener nuestros servicios</li>
                  <li>Procesar facturas y transacciones</li>
                  <li>Cumplir con obligaciones fiscales ante AFIP</li>
                  <li>Comunicarnos con usted sobre su cuenta</li>
                  <li>Mejorar nuestros servicios y experiencia de usuario</li>
                  <li>Detectar y prevenir fraudes</li>
                  <li>Cumplir con requisitos legales y regulatorios</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">4. Base Legal para el Procesamiento</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Procesamos sus datos personales bajo las siguientes bases legales:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Consentimiento:</strong> Cuando usted nos proporciona su consentimiento explícito</li>
                  <li><strong>Ejecución de contrato:</strong> Para cumplir con nuestros servicios contratados</li>
                  <li><strong>Obligaciones legales:</strong> Para cumplir con leyes tributarias y regulaciones</li>
                  <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y prevenir fraudes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">5. Compartir Información</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Podemos compartir su información con:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>AFIP:</strong> Para cumplir con obligaciones fiscales</li>
                  <li><strong>Proveedores de servicios:</strong> Que nos ayudan a operar la plataforma</li>
                  <li><strong>Autoridades legales:</strong> Cuando sea requerido por ley</li>
                  <li><strong>Empresas relacionadas:</strong> Dentro de su red de proveedores y clientes en PayTo</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Nunca vendemos su información personal a terceros.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">6. Seguridad de los Datos</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Encriptación SSL/TLS para la transmisión de datos</li>
                  <li>Encriptación de datos en reposo</li>
                  <li>Controles de acceso y autenticación robustos</li>
                  <li>Auditorías de seguridad regulares</li>
                  <li>Backup y recuperación de datos</li>
                  <li>Monitoreo continuo de amenazas</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">7. Retención de Datos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Conservamos sus datos personales durante el tiempo necesario para cumplir con los fines descritos 
                  en esta política, incluyendo requisitos legales, contables y de reporte. Los datos fiscales se 
                  conservan según lo requiere la legislación argentina (mínimo 10 años para documentación comercial).
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">8. Sus Derechos</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  De acuerdo con la Ley 25.326, usted tiene derecho a:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                  <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                  <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos (sujeto a obligaciones legales)</li>
                  <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                  <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                  <li><strong>Revocación:</strong> Retirar su consentimiento en cualquier momento</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Para ejercer estos derechos, contáctenos en <strong>privacidad@payto.com</strong>
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">9. Cookies y Tecnologías Similares</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso del servicio 
                  y personalizar contenido. Puede controlar las cookies a través de la configuración de su navegador.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">10. Transferencias Internacionales</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Sus datos se almacenan y procesan principalmente en Argentina. Si se requiere transferir datos 
                  fuera del país, implementamos salvaguardas apropiadas para proteger su información.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">11. Privacidad de Menores</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nuestro servicio no está dirigido a menores de 18 años. No recopilamos intencionalmente información 
                  de menores. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos inmediatamente.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">12. Cambios a esta Política</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios 
                  significativos publicando la nueva política en nuestro sitio web y actualizando la fecha de 
                  "última actualización".
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-medium mb-4">13. Autoridad de Control</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tiene derecho a presentar una queja ante la Agencia de Acceso a la Información Pública (AAIP), 
                  la autoridad de protección de datos de Argentina.
                </p>
              </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

