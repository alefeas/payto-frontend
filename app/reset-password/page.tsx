import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { colors } from "@/styles/colors";
import { FluidGradient } from "@/components/ui/fluid-gradient";
import AnimatedTextCarousel from "@/components/auth/animated-text-carousel";
import SlantedPanel from "@/components/ui/slanted-panel";

const messages = [
  [
    { text: "Making " },
    { text: "big", bold: true },
    { text: " things." },
  ],
  [
    { text: "Pay to " },
    { text: "whoever", bold: true },
    { text: "." },
  ],
  [
    { text: "Try it by " },
    { text: "yourself", bold: true },
    { text: "." },
  ],
  [
    { text: "Huge", bold: true },
    { text: " things are coming." },
  ],
  [
    { text: "A " },
    { text: "company", bold: true },
    { text: " for your company." },
  ],
];

function ResetPasswordContent() {
  return (
    <div className="min-h-screen bg-white p-8 lg:p-12">
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
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
