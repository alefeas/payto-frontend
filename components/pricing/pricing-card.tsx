"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  title: string;
  description: string;
  monthlyPrice: string;
  features: string[];
  featured?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export default function PricingCard({
  title,
  description,
  monthlyPrice,
  features,
  featured = false,
  selected = false,
  onClick,
}: PricingCardProps) {
  return (
    <Card
      className="relative rounded-3xl"
      style={{ 
        borderWidth: '2px', 
        borderStyle: 'solid', 
        borderColor: 'rgb(209, 213, 219)'
      }}
    >
      {featured && (
        <Badge className="absolute -top-3 left-6 bg-blue-600 text-white hover:bg-blue-700">
          <span className="ml-1">RECOMENDADO</span>
        </Badge>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{monthlyPrice}</span>
            <span className="text-sm text-muted-foreground">/mes</span>
          </div>
        </div>

        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center mt-0.5">
                <Check className="h-2.5 w-2.5 text-blue-600" />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <Button asChild size="lg" className="w-full">
          <a href="/sign-up">Comenzar ahora</a>
        </Button>
      </CardContent>
    </Card>
  );
}
