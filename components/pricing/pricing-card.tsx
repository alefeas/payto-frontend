"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  monthlyPrice: string;
  perPaymentPrice: string;
  featured?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export default function PricingCard({
  title,
  monthlyPrice,
  perPaymentPrice,
  featured = false,
  selected = false,
  onClick,
}: PricingCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-3xl border border-[#eeeeee] p-6 transition-all cursor-pointer bg-white",
        selected ? "border-primary shadow-lg" : "hover:border-[#cccccc]",
        featured && "border-primary shadow-lg"
      )}
    >
      {featured && (
        <div className="absolute -top-3 left-6 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <span>🔥</span>
          <span>MEJOR OFERTA</span>
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-4">{title}</h3>
          
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-medium">{monthlyPrice}</div>
              <div className="text-sm text-muted-foreground">cada mes</div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-medium">{perPaymentPrice}</div>
              <div className="text-sm text-muted-foreground">por pago</div>
            </div>
          </div>
        </div>
        
        {(selected || featured) && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-foreground flex items-center justify-center">
            <Check className="h-4 w-4 text-background" />
          </div>
        )}
      </div>
    </div>
  );
}
