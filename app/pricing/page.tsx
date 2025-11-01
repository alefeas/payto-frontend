"use client";

import { useState } from "react";
import Navbar from "@/components/global/navbar";
import PricingHeader from "@/components/pricing/pricing-header";
import PricingCard from "@/components/pricing/pricing-card";
import Footer from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/pricing/data";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<number>(0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden flex flex-col">
        <section className="flex-1 pt-32 pb-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <PricingHeader />
            <div className="space-y-4 mt-16 mb-8">
              {pricingPlans.map((plan, index) => (
                <PricingCard
                  key={index}
                  title={plan.title}
                  monthlyPrice={plan.monthlyPrice}
                  perPaymentPrice={plan.perPaymentPrice}
                  featured={plan.featured}
                  selected={selectedPlan === index}
                  onClick={() => setSelectedPlan(index)}
                />
              ))}
            </div>
            
            <Button 
              asChild
              size="lg" 
              className="w-full h-14 text-base rounded-full"
            >
              <a href="/sign-up">Comenzar</a>
            </Button>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
