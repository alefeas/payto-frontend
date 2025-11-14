import Image from "next/image";

export default function HoldingPhone() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Image
        src="/images/landing-page-hero-image-01.png"
        alt="Payto application interface"
        width={600}
        height={600}
        className="w-full h-auto object-contain"
        priority
      />
      <div className="absolute top-[10%] left-0 right-0 text-center px-12 md:px-16 lg:px-20">
        <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-light tracking-wide leading-tight">
          Haciendo
        </h2>
        <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide leading-tight">
          cosas <span className="font-bold">grandes.</span>
        </h2>
      </div>
    </div>
  );
}
