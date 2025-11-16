import ContactForm from "@/components/contact/contact-form";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-12">
      <div className="max-w-[448px] mx-auto lg:max-w-6xl">
        <div className="h-full min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[448px]">
            <ContactForm />
          </div>
        </div>

        {/* Right Side - Maps and Info */}
        <div className="flex-1 flex flex-col justify-center space-y-6 max-w-[448px]">
          {/* Google Maps */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-[250px] sm:h-[300px] lg:h-[350px]">
            <iframe
              src="https://www.google.com/maps?q=UTN+Facultad+Regional+Buenos+Aires+Sede+Haedo,+Paris+532,+Haedo,+Buenos+Aires&output=embed&z=16"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación UTN Haedo"
            />
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
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
                  <p className="text-sm text-gray-600">París 532, Haedo</p>
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
