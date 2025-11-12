import ContactForm from "@/components/contact/contact-form";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="h-full min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-1">
          <div className="w-full max-w-md">
            <ContactForm />
          </div>
        </div>

        {/* Right Side - Google Maps */}
        <div className="flex-1 lg:w-[58%] order-2 lg:order-2 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <div className="relative w-full h-full min-h-[400px] lg:min-h-[600px]">
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
      </div>
      </div>
    </div>
  );
}
