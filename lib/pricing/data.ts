export interface PricingPlan {
  title: string;
  monthlyPrice: string;
  perPaymentPrice: string;
  featured?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    title: "1000 pagos al mes",
    monthlyPrice: "249.99 US$",
    perPaymentPrice: "0.24 US$",
    featured: true,
  },
  {
    title: "500 pagos al mes",
    monthlyPrice: "149.99 US$",
    perPaymentPrice: "0.29 US$",
    featured: false,
  },
  {
    title: "100 pagos al mes",
    monthlyPrice: "39.99 US$",
    perPaymentPrice: "0.39 US$",
    featured: false,
  },
];
