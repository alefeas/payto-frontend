import Navbar from "@/components/global/navbar";
import PricingHeader from "@/components/pricing/pricing-header";
import PricingCard from "@/components/pricing/pricing-card";
import Footer from "@/components/landing/footer";
import { pricingPlans } from "@/lib/pricing/data";

export default function PricingPage() {

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden flex flex-col">
        <section className="flex-1 pt-32 pb-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <PricingHeader />
            <div className="grid md:grid-cols-2 gap-6 mt-16">
              {pricingPlans.map((plan, index) => (
                <PricingCard
                  key={index}
                  title={plan.title}
                  description={plan.description}
                  monthlyPrice={plan.monthlyPrice}
                  features={plan.features}
                  featured={plan.featured}
                />
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
