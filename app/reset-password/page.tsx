import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { colors } from "@/styles/colors";
import { FluidGradient } from "@/components/ui/fluid-gradient";
import AnimatedTextCarousel from "@/components/auth/animated-text-carousel";
import SlantedPanel from "@/components/ui/slanted-panel";

const messages = [
  [
    { text: "Haciendo " },
    { text: "cosas", bold: true },
    { text: " grandes." },
  ],
  [
    { text: "Paga a " },
    { text: "quien", bold: true },
    { text: " quieras." },
  ],
  [
    { text: "Pruébalo " },
    { text: "tú mismo", bold: true },
    { text: "." },
  ],
  [
    { text: "Cosas ", bold: false },
    { text: "enormes", bold: true },
    { text: " están por venir." },
  ],
  [
    { text: "Una " },
    { text: "empresa", bold: true },
    { text: " para tu empresa." },
  ],
];

function ResetPasswordContent() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="h-full min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center order-2 lg:order-1">
          <div className="w-full max-w-md">
            <ResetPasswordForm />
          </div>
        </div>

        {/* Right Side - Image/Visual */}
        <SlantedPanel 
          direction="right" 
          className="hidden lg:flex lg:w-[58%] order-1 lg:order-2"
          id="resetPasswordClip"
        >
          <FluidGradient 
            color1={colors.gradient.topLeft}
            color2={colors.gradient.topRight}
            color3={colors.gradient.bottomRight}
            color4={colors.gradient.bottomLeft}
          />
          
          {/* Gradient overlay and text at top right */}
          <div className="absolute inset-0 bg-gradient-to-bl from-black/40 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 p-16 z-10 max-w-2xl text-right">
            <AnimatedTextCarousel messages={messages} />
          </div>
        </SlantedPanel>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
