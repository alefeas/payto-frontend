import ContactForm from "@/components/contact/contact-form";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-12 flex items-center justify-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-stretch">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-1">
          <div className="w-full max-w-md">
            <ContactForm />
          </div>
        </div>

        {/* Right Side - Maps and Info */}
        <div className="flex-1 lg:w-[58%] order-2 lg:order-2 flex flex-col justify-center space-y-6">
          {/* Google Maps */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <div className="relative w-full h-full min-h-[300px] lg:min-h-[350px]">
              {/* Location info overlay */}
              <div className="absolute top-6 left-6 z-10 bg-white rounded-xl shadow-lg p-6 max-w-sm">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nuestra Ubicación
                </h3>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>UTN - Facultad Regional Buenos Aires</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Sede Haedo
                </p>
                <p className="text-sm text-muted-foreground">
                  París 532, Haedo, Buenos Aires
                </p>
              </div>

              {/* Google Maps iframe - UTN Haedo with marker */}
              <iframe
                src="https://www.google.com/maps?q=UTN+Facultad+Regional+Buenos+Aires+Sede+Haedo,+Paris+532,+Haedo,+Buenos+Aires&output=embed&z=16"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación UTN Haedo"
                className="absolute inset-0"
              />
            </div>
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">contacto@payto.com</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Teléfono</p>
                  <p className="text-sm text-gray-600">+54 (11) 1234-5678</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ubicación</p>
                  <p className="text-sm text-gray-600">Buenos Aires, Argentina</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Horario</p>
                  <p className="text-sm text-gray-600">Lun - Vie: 9:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
