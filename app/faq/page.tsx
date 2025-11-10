"use client";

import { useState } from "react";
import Navbar from "@/components/global/navbar";
import Footer from "@/components/landing/footer";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "¿Qué es PayTo y cómo funciona?",
    answer: "PayTo es una plataforma integral de gestión empresarial que te permite facturar electrónicamente, gestionar tus cuentas por cobrar y pagar, administrar clientes y proveedores, y generar reportes fiscales. Todo integrado con AFIP para cumplir con las normativas argentinas."
  },
  {
    question: "¿Necesito conocimientos técnicos para usar PayTo?",
    answer: "No, PayTo está diseñado para ser intuitivo y fácil de usar. Nuestra interfaz es amigable y no requiere conocimientos técnicos avanzados. Además, ofrecemos soporte para ayudarte en cualquier momento."
  },
  {
    question: "¿Cómo funciona la integración con AFIP?",
    answer: "PayTo se integra directamente con AFIP mediante certificados digitales. Una vez que configures tu certificado, podrás emitir facturas electrónicas, consultar el padrón de contribuyentes y cumplir con todas tus obligaciones fiscales desde nuestra plataforma."
  },
  {
    question: "¿Puedo gestionar múltiples empresas desde una cuenta?",
    answer: "Sí, especialmente con nuestro Plan Contadores puedes gestionar perfiles fiscales ilimitados de diferentes clientes o empresas desde una única cuenta, con un panel de control centralizado."
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Absolutamente. Implementamos las más altas medidas de seguridad incluyendo encriptación SSL/TLS, backup automático y almacenamiento seguro. Cumplimos con la Ley de Protección de Datos Personales de Argentina (Ley 25.326)."
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer: "Sí, puedes cancelar tu suscripción cuando quieras desde la configuración de tu cuenta. No hay contratos a largo plazo ni penalidades por cancelación."
  },
  {
    question: "¿Qué tipos de comprobantes puedo emitir?",
    answer: "Puedes emitir todos los tipos de comprobantes fiscales de AFIP: Facturas A, B, C, Notas de Crédito, Notas de Débito, Recibos, y más. Todos los comprobantes son electrónicos y válidos ante AFIP."
  },
  {
    question: "¿Ofrecen soporte técnico?",
    answer: "Sí, todos nuestros planes incluyen soporte. El Plan Empresas tiene soporte prioritario, mientras que el Plan Contadores incluye soporte premium 24/7 para asegurarnos de que siempre tengas ayuda cuando la necesites."
  },
  {
    question: "¿Puedo importar datos de mi sistema anterior?",
    answer: "Sí, ofrecemos herramientas de importación para que puedas migrar tus datos desde otras plataformas o sistemas. Nuestro equipo de soporte puede ayudarte en el proceso de migración."
  },
  {
    question: "¿Hay límite de facturas o usuarios?",
    answer: "Depende del plan. El Plan Empresas incluye usuarios ilimitados para tu equipo. No hay límites artificiales en la cantidad de facturas que puedes emitir."
  },
  {
    question: "¿Puedo probar PayTo antes de suscribirme?",
    answer: "Sí, ofrecemos un período de prueba gratuito para que puedas explorar todas las funcionalidades de la plataforma antes de comprometerte con un plan."
  },
  {
    question: "¿PayTo funciona en dispositivos móviles?",
    answer: "Sí, PayTo es totalmente responsive y funciona perfectamente en computadoras, tablets y smartphones. Puedes gestionar tu negocio desde cualquier dispositivo con conexión a internet."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden flex flex-col pt-20">
        <section className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-16">
          <div className="w-full max-w-4xl mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-foreground mb-4">
                Preguntas Frecuentes
              </h1>
              <p className="text-xl text-muted-foreground">
                Encuentra respuestas a las preguntas más comunes sobre PayTo
              </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg font-semibold text-foreground pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`flex-shrink-0 w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      openIndex === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="px-6 pb-5 pt-2">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-16 text-center bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                ¿No encontraste lo que buscabas?
              </h2>
              <p className="text-muted-foreground mb-6">
                Nuestro equipo está listo para ayudarte con cualquier pregunta
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Contáctanos
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

