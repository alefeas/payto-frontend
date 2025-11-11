export interface PricingPlan {
  title: string;
  description: string;
  monthlyPrice: string;
  features: string[];
  featured?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    title: "Plan Empresas",
    description: "Perfecto para empresas que necesitan gestionar su facturación con todo su equipo",
    monthlyPrice: "$49.99",
    features: [
      "Usuarios ilimitados",
      "Facturación electrónica AFIP",
      "Gestión de cuentas por cobrar y pagar",
      "Reportes y libro IVA",
      "Soporte prioritario",
    ],
    featured: false,
  },
  {
    title: "Plan Contadores",
    description: "Ideal para estudios contables que gestionan múltiples clientes",
    monthlyPrice: "$99.99",
    features: [
      "Todo lo del Plan Empresas",
      "Perfiles fiscales ilimitados",
      "Gestión multi-empresa",
      "Panel de control centralizado",
      "API de integración",
      "Soporte premium 24/7",
    ],
    featured: true,
  },
];
