"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FloatingBlobs from "@/components/global/floating-blobs";

export default function FloatingCards() {
  return (
    <div className="relative w-full h-[500px]">
      {/* Animated Floating Blob */}
      <FloatingBlobs position="center" />

      {/* Kelly Jenni Small Card - Top Left */}
      <Card className="absolute top-0 left-0 w-[170px] p-4 z-30 animate-float-diagonal">
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-2 mb-3">
            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-muted to-muted-foreground/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm truncate">Kelly Jenni</p>
              <p className="text-xs text-muted-foreground">Tester</p>
            </div>
          </div>
          <Button className="rounded-lg w-full py-2 text-sm">
            Pay now
          </Button>
        </div>
      </Card>

      {/* Main Credit Card */}
      <Card className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[360px] p-5 animate-float-up z-50">
        <div className="space-y-4">
          {/* Balance Section */}
          <div>
            <p className="text-4xl font-medium text-foreground tracking-tight">
              $ 6421.50
            </p>
            <p className="text-xs text-muted-foreground mt-1">Balance</p>
          </div>

          {/* Card Number */}
          <div className="py-1">
            <p className="text-muted-foreground tracking-[0.3em] text-base font-thin">
              ····  ····  ····  3667
            </p>
          </div>

          {/* Bottom Row - Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              {/* Home Icon */}
              <Button variant="outline" size="icon-sm" className="rounded-lg">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </Button>
              {/* Card Icon */}
              <Button variant="outline" size="icon-sm" className="rounded-lg">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="12"
                    rx="2"
                    strokeWidth="2"
                  />
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                </svg>
              </Button>
              {/* Arrow Icon */}
              <Button variant="outline" size="icon-sm" className="rounded-lg">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>
            {/* Pay Button */}
            <Button className="rounded-lg px-8 py-2 font-medium text-sm">
              Pay
            </Button>
          </div>

          {/* Menu Dots - Top Right */}
          <Button variant="ghost" size="icon-sm" className="absolute top-5 right-5 text-muted-foreground hover:text-foreground">
            ⋯
          </Button>

          {/* Mastercard Logo - Top Right Corner */}
          <div className="absolute top-5 right-12 w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <div className="flex gap-[-4px]">
              <div className="w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-80 -ml-1.5"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Outstanding Card */}
      <Card className="absolute top-[280px] left-0 w-[210px] p-4 z-15 animate-float-horizontal">
        <div className="flex flex-col gap-0">
          <p className="text-xs text-muted-foreground mb-2">Outstanding</p>
          <p className="text-3xl font-medium text-foreground mb-3">$89.5</p>
          <Button variant="secondary" className="w-full rounded-lg py-2.5 px-4 text-sm">
            Add more
          </Button>
        </div>
      </Card>

      {/* Thomas Josef Card */}
      <Card className="absolute top-[280px] right-0 w-[210px] p-4 z-10 animate-float-circle">
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-3 mb-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-muted to-muted-foreground/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm truncate">Thomas Josef</p>
              <p className="text-xs text-muted-foreground">Designer</p>
            </div>
          </div>
          <Button className="rounded-lg w-full py-2 font-medium text-sm">
            Pay now
          </Button>
        </div>
      </Card>
    </div>
  );
}

